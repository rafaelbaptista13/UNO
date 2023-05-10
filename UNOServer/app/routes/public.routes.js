module.exports = (app) => {
  const public = require("../controllers/public.controller.js");

  let router = require("express").Router();

  // Retrieve image
  router.get(
    "/images/:id",
    public.getImage
  );

  app.use("/api", router);
};
