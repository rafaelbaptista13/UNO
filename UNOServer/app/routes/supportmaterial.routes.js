const authJwt = require("../middleware/authJwt.js");
const upload = require("../middleware/upload");

module.exports = (app) => {
  const supportmaterials = require("../controllers/supportmaterial.controller.js");

  let router = require("express").Router();

  // Create a new Support Material
  router.post(
    "/:class_id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass, upload.single("media")],
    supportmaterials.create
  );
  // Update a Support Material
  router.put(
    "/:class_id/:supportmaterial_id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass, upload.single("media")],
    supportmaterials.update
  );
  // Get the media from a Support Material
  router.get(
    "/:class_id/:supportmaterial_id/media",
    [authJwt.verifyToken, authJwt.isPartOfRequestedClass],
    supportmaterials.getMedia
  );
  // Retrieve a support material by id
  router.get(
    "/:class_id/:supportmaterial_id",
    [authJwt.verifyToken, authJwt.isPartOfRequestedClass],
    supportmaterials.findOne
  );
  // Retrieve support materials of a class
  router.get(
    "/:class_id",
    [authJwt.verifyToken, authJwt.isPartOfRequestedClass],
    supportmaterials.findAll
  );
  // Change order of support materials
  router.put(
    "/:class_id/change_order",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass],
    supportmaterials.change_order
  );
  // Delete a support material by id
  router.delete(
    "/:class_id/:supportmaterial_id",
    [authJwt.verifyToken, authJwt.isTeacher, authJwt.isTeacherOfRequestedClass],
    supportmaterials.delete
  );

  app.use("/api/supportmaterials", router);
};
