const db = require("../models");
const Notification = db.notifications;

// Retrieve all notifications of a user
exports.getNotifications = async (req, res) => {
  const notifications = await Notification.findAll({
    where: {
      user_id: req.userId
    },
    order: [['createdAt', 'DESC']]
  });

  res.send(notifications);
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  const notification_id = req.params.notification_id;
  const user_id = req.userId;

  // Get notification
  let notification;
  try {
    notification = await Notification.findOne({
      where: { 
        id: notification_id,
        user_id: user_id
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "An error occured.",
    });
    return;
  }

  if (!notification) {
    res.status(400).send({
      message: `Notification does not exist.`,
    });
    return
  } else {
    await notification.destroy();

    res.status(200).send({ message: "Notification deleted successfully."});
  }
};
