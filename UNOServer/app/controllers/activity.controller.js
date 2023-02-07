const db = require("../models");
const Activity = db.activities;
const Op = db.Sequelize.Op;

// Create and Save a new Activity
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.weekcontent_id || !req.body.type || !req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Get number of activity
  let activities_data;
  try {
    activities_data = await Activity.findAll({
      where: { weekcontent_id: { [Op.eq]: `${req.body.weekcontent_id}` } },
      order: [['activity_number', 'DESC']]
    });
  } catch (e) {
    console.log(e);
  }

  let activity_number = 1;
  if (activities_data.length !== 0)
    activity_number = activities_data[0].dataValues.activity_number + 1;

  // Create a Activity
  const activity = {
    type: req.body.type,
    activity_number: activity_number,
    weekcontent_id: req.body.weekcontent_id,
    title: req.body.title,
  };

  // Save Activity in the database
  Activity.create(activity)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Activity.",
      });
    });
};

// Retrieve an activity from the database.
exports.findOne = (req, res) => {
  const id = req.params.id;

  Activity.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving the Activity.",
      });
    });
};

// Retrieve all week contents from the database.
exports.findAll = (req, res) => {
  const weekcontent_id = req.query.weekcontent_id;
  let condition = weekcontent_id
    ? { weekcontent_id: { [Op.eq]: `${weekcontent_id}` } }
    : null;

  Activity.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Activities.",
      });
    });
};

// Delete a week of contents from the database.
exports.delete = (req, res) => {
  const id = req.params.id;

  Activity.destroy({ where: { id: id } })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Activity was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Activity with id=${id}. Maybe Activity was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete Activity with id=" + id,
      });
    });
};
