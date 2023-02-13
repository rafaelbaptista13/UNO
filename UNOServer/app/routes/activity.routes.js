const authJwt = require("../middleware/authJwt.js");

module.exports = (app) => {
  const activities = require("../controllers/activity.controller.js");

  let router = require("express").Router();

  // Create a new activity
  router.post("/", [authJwt.verifyToken], activities.create);

  // Retrieve an activity given the id
  router.get("/:id", [authJwt.verifyToken], activities.findOne);

  // Retrieve activities with filters
  router.get("/", [authJwt.verifyToken], activities.findAll);

  // Update an activity
  router.put("/:id", [authJwt.verifyToken], activities.update);

  // Delete an activity given the id
  router.delete("/:id", [authJwt.verifyToken], activities.delete);

  app.use("/api/activities", router);
};
