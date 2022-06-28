const logger = require("../utils/Logger");
const aes256 = require("../utils/Aes256");
const modelUser = require("../model/Users");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const RedisClient = require("../utils/Redis");
const redisKey = "redisTokenJWT";

const ResponseClass = require("../utils/response");
const pool = require("../utils/SqlConfig");

var fs = require("fs");
var path = require("path");

module.exports = {
  loginRequired: async (req, res, next) => {
    const dataTokenJWT = await RedisClient.get(redisKey);
    if (dataTokenJWT) {
      next();
    } else {
      return res
        .status(401)
        .json({ message: "Unauthorized user!!", status: false, code: 401 });
    }
  },
  login: async (req, res) => {
    const dataTokenJWT = await RedisClient.get(redisKey);

    res.render("pages/login", { dataTokenJWT, page: req.url });
  },
  sign_in: async (req, res) => {
    let responseReturn = new ResponseClass();
    const email = req.body.email;
    const password = req.body.password;

    dataAll = await modelUser.allData("*", "users", `where email = '${email}'`);

    if (dataAll.rowCount == 0) {
      responseReturn.status = true;
      responseReturn.code = 404;
      responseReturn.message = "Email or password wrong";
      responseReturn.data = null;
    } else {
      responseReturn.status = true;
      responseReturn.code = 200;
      responseReturn.message = "Success";
      responseReturn.data = dataAll.rows[0];

      const checkLogin = bcrypt.compareSync(
        password,
        responseReturn.data.password
      );

      if (checkLogin) {
        const enkrip = aes256.encrypt(
          jwt.sign(
            {
              name: responseReturn.data.name,
              email: responseReturn.data.email,
              id: responseReturn.data.id,
            },
            "RESTFULAPIs"
          )
        );

        const insertRedis = await RedisClient.set(
          redisKey,
          JSON.stringify(enkrip),
          {
            EX: 60 * 60 * 24,
          }
        );
        if (insertRedis) {
          res.redirect("users");
          console.log("Set token with redis");

          let message = {
            id: responseReturn.data.id,
            name: responseReturn.data.name,
            email: responseReturn.data.email,
            status: "Login user",
          };
          logger.info(`${JSON.stringify(message, null, "\t")}`);
        }
      } else {
        responseReturn.status = true;
        responseReturn.code = 404;
        responseReturn.message = "Email or password wrong";
        responseReturn.data = null;
        res.json(responseReturn);
      }
    }
  },
  index: async (req, res) => {
    const dataTokenJWT = await RedisClient.get(redisKey);

    let keyword = req.query.keyword;
    let dataAll = "";
    if (keyword == undefined) {
      dataAll = await modelUser.allData("*", "users", ``);
    } else {
      dataAll = await modelUser.allData(
        "*",
        "users",
        `where name Ilike '%${keyword}%'`
      );
    }

    res.render("pages/users/index", {
      page: req.url,
      users: dataAll.rows,
      dataTokenJWT,
    });
  },
  create: async (req, res) => {
    const dataTokenJWT = await RedisClient.get(redisKey);

    res.render("pages/users/create", { dataTokenJWT, page: req.url });
  },
  store: async (req, res) => {
    const name = req.body.name;
    const img = req.file.filename;
    const email = req.body.email;
    const password_encript = bcrypt.hashSync(req.body.password, 10);

    const table = "users";
    const fields = `name, img, email, password`;
    const fieldValues = [name, img, email, password_encript];
    const values = "$1, $2, $3, $4";

    dataAll = await modelUser.Insert(table, fields, fieldValues, values);
    if (dataAll) {
      res.redirect("users");
    }
  },
  show: async (req, res) => {
    const dataTokenJWT = await RedisClient.get(redisKey);
    const id = parseInt(req.params.userId);
    let responseReturn = new ResponseClass();
    dataAll = await modelUser.allData("*", "users", `where id = '${id}'`);
    if (dataAll.rowCount == 0) {
      responseReturn.status = true;
      responseReturn.code = 404;
      responseReturn.message = "User not found";
      responseReturn.data = null;
    } else {
      responseReturn.status = true;
      responseReturn.code = 200;
      responseReturn.message = "Success";
      responseReturn.data = dataAll.rows[0];
    }
    res.render("pages/users/show", {
      users: responseReturn.data,
      dataTokenJWT,
      page: req.url,
    });
  },
  update: async (req, res) => {
    const id = req.body.id;
    if (req.file != undefined) {
      dataAll = await modelUser.allData("*", "users", `where id = '${id}'`);

      fs.unlink("./public/uploads/" + dataAll.rows[0].img, async (err) => {
        if (err) return handleError(err);

        const { name, email } = req.body;
        const img = req.file.filename;

        const table = "users";
        const fieldValues = [name, img, email];
        const values = "name = $1, img = $2, email = $3";
        const condition = `WHERE id = ${id}`;

        updateData = await modelUser.Update(
          table,
          fieldValues,
          values,
          condition
        );
        if (updateData) {
          res.redirect("users");
        }
      });
    } else {
      const { name, email } = req.body;

      const table = "users";
      const fieldValues = [name, email];
      const values = "name = $1, email = $2";
      const condition = `WHERE id = ${id}`;

      updateData = await modelUser.Update(
        table,
        fieldValues,
        values,
        condition
      );
      if (updateData) {
        res.redirect("users");
      }
    }
  },
  delete: async (req, res) => {
    const id = parseInt(req.params.userId);

    dataAll = await modelUser.allData("*", "users", `where id = '${id}'`);

    fs.unlink("./public/uploads/" + dataAll.rows[0].img, async (err) => {
      if (err) return handleError(err);
      deleteData = await modelUser.Delete("users", `where id = '${id}'`);
      if (deleteData) {
        res.redirect("../users");
      }
    });
  },
  logout: async (req, res) => {
    const logout = await RedisClient.del(redisKey);
    if (logout) {
      res.redirect("/");
    }
  },
};
