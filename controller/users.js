const logger = require("../utils/Logger");
const aes256 = require("../utils/Aes256");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const RedisClient = require("../utils/Redis");
const redisKey = "redisTokenJWT";

const ResponseClass = require("../utils/response");
const pool = require("../utils/SqlConfig");

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
  sign_in: (req, res) => {
    let responseReturn = new ResponseClass();
    // const { email, password } = req.body;
    const email = req.body.email;
    const password = req.body.password;

    pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
      async (error, results) => {
        if (error) {
          throw error;
        }
        if (results.rowCount == 0) {
          responseReturn.status = true;
          responseReturn.code = 404;
          responseReturn.message = "Email or password wrong";
          responseReturn.data = null;
        } else {
          responseReturn.status = true;
          responseReturn.code = 200;
          responseReturn.message = "Success";
          responseReturn.data = results.rows[0];

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
                EX: (60 * 60) * 24,
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
      }
    );
  },
  index: async (req, res) => {
    const dataTokenJWT = await RedisClient.get(redisKey);

    let keyword = req.query.keyword;

    let responseReturn = new ResponseClass();

    if (keyword === undefined) {
      pool.query("SELECT * FROM users", (error, results) => {
        if (error) {
          throw error;
        }

        responseReturn.status = true;
        responseReturn.code = 200;
        responseReturn.message = "Success";
        responseReturn.data = results.rows;

        res.render("pages/users/index", {
          page: req.url,
          users: responseReturn.data,
          dataTokenJWT,
        });
      });
    } else {
      pool.query(
        "SELECT * FROM users where name Ilike $1",
        [`%${keyword}%`],
        (error, results) => {
          if (error) {
            throw error;
          }

          responseReturn.status = true;
          responseReturn.code = 200;
          responseReturn.message = "Success";
          responseReturn.data = results.rows;

          res.render("pages/users/index", {
            users: responseReturn.data,
            dataTokenJWT,
            page: req.url,
          });
        }
      );
    }
  },
  create: async (req, res) => {
    const dataTokenJWT = await RedisClient.get(redisKey);

    res.render("pages/users/create", { dataTokenJWT, page: req.url });
  },
  store: (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password_encript = bcrypt.hashSync(req.body.password, 10);
    pool.query(
      "INSERT INTO users (name,email, password) VALUES ($1, $2, $3)",
      [name, email, password_encript],
      (error, results) => {
        if (error) {
          throw error;
        }
        res.redirect("users");
      }
    );
  },
  show: async (req, res) => {
    const dataTokenJWT = await RedisClient.get(redisKey);
    const id = parseInt(req.params.userId);
    let responseReturn = new ResponseClass();
    pool.query("SELECT * FROM users WHERE id = $1", [id], (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rowCount == 0) {
        responseReturn.status = true;
        responseReturn.code = 404;
        responseReturn.message = "User not found";
        responseReturn.data = null;
      } else {
        responseReturn.status = true;
        responseReturn.code = 200;
        responseReturn.message = "Success";
        responseReturn.data = results.rows[0];
      }
      res.render("pages/users/show", {
        users: responseReturn.data,
        dataTokenJWT,
        page: req.url,
      });
    });
  },
  update: (req, res) => {
    const id = req.body.id;
    let responseReturn = new ResponseClass();
    try {
      const { name, email } = req.body;
      pool.query(
        "UPDATE users SET name = $1, email = $2 WHERE id = $3",
        [name, email, id],
        (error, results) => {
          if (error) {
            throw error;
          }

          responseReturn.status = true;
          responseReturn.code = 200;
          responseReturn.message = "User modification successed";
          responseReturn.data = null;
          res.redirect("users");
        }
      );
    } catch (error) {
      responseReturn.status = false;
      responseReturn.code = 500;
      responseReturn.message = error.message;
      responseReturn.data = null;
      res.redirect("users");
    }
  },
  delete: (req, res) => {
    const id = parseInt(req.params.userId);
    pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
      if (error) {
        throw error;
      }
      res.redirect("../users");
    });
  },
  logout: async (req, res) => {
    const logout = await RedisClient.del(redisKey);
    if (logout) {
      res.redirect("/");
    }
  },
};
