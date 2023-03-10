const authJwt = require("../middleware/authJwt.js");
const upload = require("../middleware/upload");

module.exports = (app) => {
  const activities = require("../controllers/activity.controller.js");
  const mediaactivities = require("../controllers/mediaactivity.controller.js");
  const exerciseactivities = require("../controllers/exerciseactivity.controller.js");

  let router = require("express").Router();

  /**
   * Media Activities
   */
  // Create a new Media activity
  router.post(
    "/:class_id/media",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass, upload.single("media")],
    mediaactivities.createMedia
  );
  // Update a Media activity
  router.put(
    "/:class_id/media/:id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass, upload.single("media")],
    mediaactivities.updateMedia
  );
  // Get the media from a Media activity
  router.get(
    "/:class_id/:activity_id/media",
    [authJwt.verifyToken, authJwt.isPartOfRequestedClass],
    mediaactivities.getMedia
  );


  /**
   * Exercise Activities
   */
  // Create a new Exercise activity
  router.post(
    "/:class_id/exercise",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass, upload.single("media")],
    exerciseactivities.createExercise
  );
  // Submit a video to an exercise
  router.post(
    "/:class_id/:activity_id/exercise/submit",
    [authJwt.verifyToken, authJwt.isStudent, authJwt.isPartOfRequestedClass, upload.single("media")],
    exerciseactivities.submitExercise
  );
  // Update an Exercise activity
  router.put(
    "/:class_id/exercise/:id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass, upload.single("media")],
    exerciseactivities.updateExercise
  );
  // Get the media from an Exercise activity
  router.get(
    "/:class_id/:activity_id/exercise/media",
    [authJwt.verifyToken, authJwt.isPartOfRequestedClass],
    exerciseactivities.getMedia
  );
  // Get the media submitted by an user to an Exercise activity
  router.get(
    "/:class_id/:activity_id/exercise/submitted/media",
    [authJwt.verifyToken, authJwt.isPartOfRequestedClass],
    exerciseactivities.getSubmittedMedia
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
