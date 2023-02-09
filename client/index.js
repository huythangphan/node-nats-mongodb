import { connect } from "nats";

// NATS constants
const SUBJECT_NAME = "test_subject"
const NATS_SERVERS = ["nats://app_nats_server:4222"]

// create a connection to a nats-server
const natsClient = await connect({ servers: NATS_SERVERS, json: true })

// request to SUBJECT_NAME and wait for response once

// const api = 'hello'
// const api = 'initData'
const api = 'getUsers'

natsClient.requestOne(
  SUBJECT_NAME, // subject
  { api }, // message
  {}, // options
  15000, // timeout 10s
  (replyPayload) => {
    console.log(`Client request to API "${api}" `)
    console.log("Server reply: ")
    console.log(replyPayload)
  }, // callback
)


