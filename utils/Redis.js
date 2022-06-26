require("dotenv").config();
const redis = require("redis");
const client = redis.createClient({
  host: process.env.HOST_REDIS,
  port: process.env.PORT_REDIS,
});
client.on("connect", () => console.log("Connected to Redis!"));
client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();

module.exports = client;
