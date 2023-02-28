const authJwt = require("../middleware/authJwt.js");
const upload = require("../middleware/upload");

module.exports = (app) => {
  const activities = require("../controllers/activity.controller.js");

  let router = require("express").Router();

  // Create a new Media activity
  router.post(
    "/:class_id/media",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass, upload.single("media")],
    activities.createMedia
  );

  // Update a Media activity
  router.put(
    "/:class_id/media/:id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass, upload.single("media")],
    activities.updateMedia
  );

  // Get the media from a Media Activity
  router.get(
    "/:class_id/:activitygroup_id/:activity_id/media",
    [authJwt.verifyToken, authJwt.isPartOfRequestedClass],
    activities.getMediaFromMediaActivity
  );

  // Create a new activity
  router.post(
    "/:class_id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass],
    activities.create
  );

  // Retrieve an activity given the id
  router.get(
    "/:class_id/:id",
    [authJwt.verifyToken, authJwt.isPartOfRequestedClass],
    activities.findOne
  );

  // Retrieve activities with filters
  router.get(
    "/:class_id",
    [authJwt.verifyToken, authJwt.isPartOfRequestedClass],
    activities.findAll
  );

  // Change order of Activities
  router.put(
    "/:class_id/change_order",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass],
    activities.change_order
  );

  // Update an activity
  router.put(
    "/:class_id/:id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass],
    activities.update
  );

  // Delete an activity given the id
  router.delete(
    "/:class_id/:id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass],
    activities.delete
  );

  app.use("/api/activities", router);
};
