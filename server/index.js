import { connect } from "nats"
import mongoose from "mongoose"

//#region MongoDB handlers
const MONGODB_URI = "mongodb://app_mongodb:27018/test"
mongoose.connect(MONGODB_URI)

const customerSchema = mongoose.Schema(
  {
    name: String,
    email: String,
  },
)
const CustomerModel = mongoose.model('Customer', customerSchema)

async function createCustomer({ name, email }) {
  const newCustomer = new CustomerModel({ name, email })
  await newCustomer.save()
  return newCustomer

}
async function createCustomers(newCustomers) {
  return await CustomerModel.insertMany(newCustomers, { lean: true })
}
async function getAllCustomers({ keyword = '', page = 1, limit = 10 } = {}) {
  const skip = (page - 1) * limit

  const [paginatedResult] = await CustomerModel.aggregate([
    // 1. Filter by keyword
    {
      $match: {
        $or: [
          { name: new RegExp(keyword, 'i') },
          { email: new RegExp(keyword, 'i') },
        ]
      }
    },
    // 2. Limit fields
    {
      $project: {
        _id: 1,
        name: 1,
        renter: 1,
      },
    },
    // 3. Process multiple aggregation pipeline within a single stage
    {
      $facet: {
        metadata: [
          { $count: 'total' },
          { $addFields: { page, limit } },
        ],
        data: [
          { $skip: skip },
          { $limit: limit },
        ],
      },
    },
  ])

  const { metadata: [metadata], data } = paginatedResult

  return { metadata, data }
}
//#endregion MongoDB handlers

// NATS constants
const SUBJECT_NAME = "test_subject"
const NATS_SERVERS = ["nats://app_nats_server:4222"]

// create a connection to a nats-server
const natsClient = await connect({ servers: NATS_SERVERS, json: true })

// listen to SUBJECT_NAME
natsClient.subscribe(SUBJECT_NAME, async (requestPayload, sender) => {
  // -- api --
  const { api, payload } = requestPayload

  console.log(`api: ${api}`)

  switch (api) {
    case "initData": {
      await createCustomers([
        { name: 'customer 1', email: 'customer1@gmail.com' },
        { name: 'customer 2', email: 'customer2@gmail.com' },
        { name: 'customer 3', email: 'customer3@gmail.com' },
        { name: 'customer 4', email: 'customer4@gmail.com' },
      ])

      // reply to sender
      natsClient.publish(sender, { success: true })
      break
    }
    case "getUsers": {
      // reply to sender
      natsClient.publish(sender, await getAllCustomers())
      break
    }
    default: {
      // reply to sender
      natsClient.publish(sender, "Unknown API")
      break
    }
  }
})


