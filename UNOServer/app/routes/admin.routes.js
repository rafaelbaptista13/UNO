const authJwt = require("../middleware/authJwt.js");

module.exports = (app) => {
  const admin = require("../controllers/admin.controller.js");

  let router = require("express").Router();

  // Change user password
  router.post(
    "/change_password/:user_id",
    [authJwt.verifyToken, authJwt.isAdmin],
    admin.change_password
  );

  app.use("/api/admin", router);
};
