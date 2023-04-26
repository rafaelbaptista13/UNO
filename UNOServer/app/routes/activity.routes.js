const authJwt = require("../middleware/authJwt.js");
const { upload, processMedia, deleteUploadedFiles, processMediaInQuestionActivity, deleteUploadedFilesQuestion } = require("../middleware/upload");

module.exports = (app) => {
  const activities = require("../controllers/activity.controller.js");
  const mediaactivities = require("../controllers/mediaactivity.controller.js");
  const exerciseactivities = require("../controllers/exerciseactivity.controller.js");
  const questionactivities = require("../controllers/questionactivity.controller.js");
  const gameactivities = require("../controllers/gameactivity.controller.js");

  let router = require("express").Router();

  /**
   * Media Activities
   */
  // Create a new Media activity
  router.post(
    "/:class_id/media",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass, upload.single("media"), processMedia],
    deleteUploadedFiles,
    mediaactivities.createMedia
  );
  // Content saw
  router.post(
    "/:class_id/:activity_id/media/submit",
    [authJwt.verifyToken, authJwt.isStudent, authJwt.isPartOfRequestedClass],
    mediaactivities.submit
  );
  // Update a Media activity
  router.put(
    "/:class_id/media/:id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass, upload.single("media"), processMedia],
    deleteUploadedFiles,
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
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass, upload.single("media"), processMedia],
    deleteUploadedFiles,
    exerciseactivities.createExercise
  );
  // Submit a video to an exercise
  router.post(
    "/:class_id/:activity_id/exercise/submit",
    [authJwt.verifyToken, authJwt.isStudent, authJwt.isPartOfRequestedClass, upload.single("media"), processMedia],
    deleteUploadedFiles,
    exerciseactivities.submitExercise
  );
  // Update an Exercise activity
  router.put(
    "/:class_id/exercise/:id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass, upload.single("media"), processMedia],
    deleteUploadedFiles,
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
  // Get the media submitted by an user to an Exercise activity (Teacher)
  router.get(
    "/teacher/:class_id/:activity_id/exercise/submitted/media/:student_id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass],
    exerciseactivities.getSubmittedMediaOfStudent
  );
  // Put Feedback to student
  router.put(
    "/teacher/:class_id/:activity_id/exercise/feedback/:student_id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass],
    exerciseactivities.putFeedbackToStudent
  )


  /**
   * Question Activities
   */
  // Create a new Question activity
  router.post(
    "/:class_id/question",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass, upload.fields([
      { name: "question_media", maxCount: 1},
      { name: "answers_media", maxCount: 10}
    ]), processMediaInQuestionActivity],
    deleteUploadedFilesQuestion,
    questionactivities.createQuestion
  );
  // Submit an question
  router.post(
    "/:class_id/:activity_id/question/submit",
    [authJwt.verifyToken, authJwt.isStudent, authJwt.isPartOfRequestedClass],
    questionactivities.submitQuestion
  );
  // Get the media from a Question activity
  router.get(
    "/:class_id/:activity_id/question/media",
    [authJwt.verifyToken, authJwt.isPartOfRequestedClass],
    questionactivities.getMedia
  );
  // Get the media from an answer
  router.get(
    "/:class_id/:activity_id/question/answers/:order/media",
    [authJwt.verifyToken, authJwt.isPartOfRequestedClass],
    questionactivities.getMediaFromAnswer
  );
  // Put Feedback to student
  router.put(
    "/teacher/:class_id/:activity_id/question/feedback/:student_id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass],
    questionactivities.putFeedbackToStudent
  )


  /**
   * Game Activities
   */
  router.post(
    "/:class_id/game",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass],
    gameactivities.createGame
  );
  // Get the media submitted by an user to a Game activity
  router.get(
    "/:class_id/:activity_id/game/submitted/media",
    [authJwt.verifyToken, authJwt.isPartOfRequestedClass],
    gameactivities.getSubmittedMedia
  );
  // Get the media submitted by an user to a Game activity (Teacher)
  router.get(
    "/teacher/:class_id/:activity_id/game/submitted/media/:student_id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass],
    gameactivities.getSubmittedMediaOfStudent
  );
  // Submit activity of type Play
  router.post(
    "/:class_id/:activity_id/game/play/submit",
    [authJwt.verifyToken, authJwt.isStudent, authJwt.isPartOfRequestedClass, upload.single("media"), processMedia],
    deleteUploadedFiles,
    gameactivities.submitGamePlay
  );
  // Submit activity of type Identify
  router.post(
    "/:class_id/:activity_id/game/identify/submit",
    [authJwt.verifyToken, authJwt.isStudent, authJwt.isPartOfRequestedClass],
    gameactivities.submitGameIdentify
  );
  // Submit activity of type Build
  router.post(
    "/:class_id/:activity_id/game/build/submit",
    [authJwt.verifyToken, authJwt.isStudent, authJwt.isPartOfRequestedClass, upload.single("media"), processMedia],
    deleteUploadedFiles,
    gameactivities.submitGameBuild
  );
  // Put Feedback to student
  router.put(
    "/teacher/:class_id/:activity_id/game/feedback/:student_id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass],
    gameactivities.putFeedbackToStudent
  )

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

  /**
   * Teacher endpoints
   */
  // Retrieve activities of a specific activitygroup of a student
  router.get(
    "/teacher/:class_id/:activitygroup_id/:student_id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass],
    activities.getActivitiesOfActivityGroupOfStudent
  );
  // Retrieve activity of a student
  router.get(
    "/teacher/:class_id/:activitygroup_id/:activity_id/:student_id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass],
    activities.getActivityOfStudent
  );

  app.use("/api/activities", router);
};
