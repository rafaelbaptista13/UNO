const authJwt = require("../middleware/authJwt.js");

module.exports = (app) => {
  const notifications = require("../controllers/notification.controller.js");

  let router = require("express").Router();

  // Retrieve all notifications of a user
  router.get(
    "/",
    [authJwt.verifyToken],
    notifications.getNotifications
  );

  // Delete a notification
  router.delete(
    "/:notification_id",
    [authJwt.verifyToken],
    notifications.deleteNotification
  );

  app.use("/api/notifications", router);
};
