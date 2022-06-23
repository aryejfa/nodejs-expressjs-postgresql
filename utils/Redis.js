const redis = require("redis");
const client = redis.createClient({
  host: "127.0.0.1",
  port: 6379,
});
client.on("connect", () => console.log("Connected to Redis!"));
client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();

module.exports = client;
