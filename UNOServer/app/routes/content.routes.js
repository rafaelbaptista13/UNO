module.exports = app => {
    const contents = require("../controllers/content.controller.js");
  
    let router = require("express").Router();
  
    // Create a new Content
    router.post("/", contents.create);
  
    // Retrieve all Contents
    router.get("/", contents.findAll);
  
    app.use('/api/contents', router);
  };