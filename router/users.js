const express = require("express");
const router = express.Router();
const userController = require("../hmvc/users/controller/users");
const Upload = require("../utils/Upload");

router.route("/login").get(userController.login).post(userController.sign_in);
router
  .route("/users")
  .get(userController.loginRequired, userController.index)
  .post(
    Upload.single("image"),
    userController.loginRequired,
    userController.store
  );
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
  Upload.single("image"),
  userController.loginRequired,
  userController.update
);
router.get(
  "/delete/:userId",
  userController.loginRequired,
  userController.delete
);
router.get("/logout", userController.logout);

module.exports = router;
