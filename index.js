require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.EXPRESS_PORT;
const routerUsers = require("./router/users");
const jsonwebtoken = require("jsonwebtoken");

const RedisClient = require("./utils/Redis");
const redisKey = "redisTokenJWT";

var path = require("path");

// PERMISSION BODY
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// PERMISSION BODY

// MIDDLEWARE
app.use(function (req, res, next) {
  const token = req.header("Authorization");
  if (token) {
    jsonwebtoken.verify(
      req.headers.authorization.split(" ")[1],
      "RESTFULAPIs",
      function (err, decode) {
        if (err) req.user = undefined;
        req.user = decode;
        next();
      }
    );
  } else {
    req.user = undefined;
    next();
  }
});
// MIDDLEWARE

// EJS TEMPLATE
app.set("views", path.join(__dirname, "/hmvc/users/views"));

app.set("view engine", "ejs");

app.use("/assets", express.static("public"));
app.use("/uploads", express.static("public/uploads"));
// EJS TEMPLATE

// ROUTE
app.get("/", async (req, res) => {
  const dataTokenJWT = await RedisClient.get(redisKey);
  res.render("pages/index", { dataTokenJWT, page: req.url });
});

app.get("/about", async (req, res) => {
  const dataTokenJWT = await RedisClient.get(redisKey);
  res.render("pages/about", { dataTokenJWT, page: req.url });
});

app.use(routerUsers);

app.use(function (req, res) {
  res
    .status(404)
    .send({ url: req.originalUrl + " not found", status: false, code: 404 });
});
// ROUTE

app.listen(port, () => {
  console.log(`server run port ${port}`);
});
