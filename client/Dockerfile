# Base image
FROM node:14.18.1-alpine

# Set worknig directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Start
CMD [ "npm", "start" ]


