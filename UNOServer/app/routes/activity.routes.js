module.exports = app => {
    const activities = require("../controllers/activity.controller.js");
  
    let router = require("express").Router();
  
    // Create a new activity
    router.post("/", activities.create);

    // Retrieve an activity given the id
    router.get("/:id", activities.findOne)

    // Retrieve activities with filters
    router.get("/", activities.findAll)

    // Delete an activity given the id 
    router.delete("/:id", activities.delete)
  
    app.use('/api/activities', router);
  };