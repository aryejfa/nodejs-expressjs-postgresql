const express = require("express");
const router = express.Router();
const userController = require("../controller/users");

router.route("/login").get(userController.login).post(userController.sign_in);
router
  .route("/users")
  .get(userController.loginRequired, userController.index)
  .post(userController.loginRequired, userController.store);
router.get(
  "/users/create",
  userController.loginRequired,
  userController.create
);
router.get(
  "/users/show/:userId",
  userController.loginRequired,
  userController.show
);
router.post(
  "/users_update",
  userController.loginRequired,
  userController.update
);
router.get(
  "/delete/:userId",
  userController.loginRequired,
  userController.delete
);
router.get(
  "/logout",
  userController.logout
);

module.exports = router;
