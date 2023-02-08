const authJwt = require("../middleware/authJwt.js");

module.exports = app => {
    const contents = require("../controllers/content.controller.js");
  
    let router = require("express").Router();
  
    // Create a new week of contents
    router.post("/weeks", contents.create);

    // Retrieve a specific week of contents by id
    router.get("/weeks/:id", contents.findOne);

    // Retrieve all weeks of contents
    router.get("/weeks", [authJwt.verifyToken], contents.findAll);

    // Delete a week of contents
    router.delete("/weeks/:id", contents.delete)
  
    app.use('/api/contents', router);
  };