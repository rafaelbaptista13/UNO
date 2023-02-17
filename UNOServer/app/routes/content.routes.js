const authJwt = require("../middleware/authJwt.js");

module.exports = (app) => {
  const contents = require("../controllers/content.controller.js");

  let router = require("express").Router();

  // Create a new week of contents
  router.post(
    "/weeks/:class_id",
    [
      authJwt.verifyToken,
      authJwt.isTeacher,
      authJwt.isTeacherOfRequestedClass,
    ],
    contents.create
  );

  // Retrieve a specific week of contents by id
  router.get("/weeks/:class_id/:weekcontent_id", [authJwt.verifyToken, authJwt.isPartOfRequestedClass], contents.findOne);

  // Retrieve all weeks of contents of a class
  router.get("/weeks/:class_id", [authJwt.verifyToken, authJwt.isPartOfRequestedClass], contents.findAll);

  // Delete a week of contents
  router.delete(
    "/weeks/:class_id/:weekcontent_id",
    [
      authJwt.verifyToken,
      authJwt.isTeacher,
      authJwt.isTeacherOfRequestedClass,
    ],
    contents.delete
  );

  app.use("/api/contents", router);
};
