const authJwt = require("../middleware/authJwt.js");

module.exports = (app) => {
  const activitygroup = require("../controllers/activitygroup.controller.js");

  let router = require("express").Router();

  // Create a new ActivityGroup
  router.post(
    "/:class_id",
    [
      authJwt.verifyToken,
      authJwt.isTeacher,
      authJwt.isTeacherOfRequestedClass,
    ],
    activitygroup.create
  );

  // Change order of ActivityGroups
  router.put(
    "/:class_id/change_order",
    [
      authJwt.verifyToken,
      authJwt.isTeacher,
      authJwt.isTeacherOfRequestedClass,
    ],
    activitygroup.change_order
  );

  // Update an ActivityGroup
  router.put(
    "/:class_id/:id",
    [
      authJwt.verifyToken,
      authJwt.isTeacher,
      authJwt.isTeacherOfRequestedClass,
    ],
    activitygroup.update
  );

  // Retrieve a specific ActivityGroup by id
  router.get("/:class_id/:activitygroup_id", [authJwt.verifyToken, authJwt.isPartOfRequestedClass], activitygroup.findOne);

  // Retrieve all ActivityGroups of a class
  router.get("/:class_id", [authJwt.verifyToken, authJwt.isPartOfRequestedClass], activitygroup.findAll);

  // Delete a ActivityGroup
  router.delete(
    "/:class_id/:activitygroup_id",
    [
      authJwt.verifyToken,
      authJwt.isTeacher,
      authJwt.isTeacherOfRequestedClass,
    ],
    activitygroup.delete
  );

  app.use("/api/activitygroup", router);
};
