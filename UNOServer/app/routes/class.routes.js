const authJwt = require("../middleware/authJwt.js");

module.exports = (app) => {
  const classes = require("../controllers/class.controller.js");

  let router = require("express").Router();

  // Create a new Class
  router.post("/", [authJwt.verifyToken, authJwt.isTeacher], classes.create);

  // Retrieve the users of a class
  router.get(
    "/:class_id",
    [
      authJwt.verifyToken,
      authJwt.isTeacher,
      authJwt.isTeacherOfRequestedClass,
    ],
    classes.findOne
  );

  // Retrieve the classes a teacher has
  router.get("/", [authJwt.verifyToken, authJwt.isTeacher], classes.findAll);

  // Update a class
  router.put(
    "/:class_id",
    [
      authJwt.verifyToken,
      authJwt.isTeacher,
      authJwt.isTeacherOfRequestedClass,
    ],
    classes.update
  );

  // Delete a class given the id
  router.delete(
    "/:class_id",
    [
      authJwt.verifyToken,
      authJwt.isTeacher,
      authJwt.isTeacherOfRequestedClass,
    ],
    classes.delete
  );

  app.use("/api/classes", router);
};
