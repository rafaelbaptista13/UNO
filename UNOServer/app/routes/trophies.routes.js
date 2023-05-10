const authJwt = require("../middleware/authJwt.js");

module.exports = (app) => {
  const trophy = require("../controllers/trophy.controller.js");

  let router = require("express").Router();

  // Retrieve the trophies a user does not has yet 
  router.get(
    "/:class_id/available/:student_id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass],
    trophy.getUserAvailableTrophies
  );

  // Retrieve all trophies a user has
  router.get(
    "/",
    [authJwt.verifyToken, authJwt.isStudent],
    trophy.getUserTrophies
  );

  app.use("/api/trophies", router);
};
