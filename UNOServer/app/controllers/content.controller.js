const db = require("../models");
const WeekContent = db.weekcontents;
const Op = db.Sequelize.Op;

// Create and Save a new Content
exports.create = async (req, res) => {
  // Validate request
  if (req.body.number_of_videos === undefined || req.body.number_of_exercises === undefined) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Get number of weekContent
  let weekcontent_data;
  try {
    weekcontent_data = await WeekContent.findAll({
      order: [['week_number', 'DESC']]
    });
  } catch (e) {
    console.log(e);
  }

  let week_number = 1;
  if (weekcontent_data.length !== 0)
  week_number = weekcontent_data[0].dataValues.week_number + 1;

  // Create a WeekContent
  const weekcontent = {
    week_number: week_number,
    number_of_videos: req.body.number_of_videos,
    number_of_exercises: req.body.number_of_exercises,
  };

  // Save WeekContent in the database
  WeekContent.create(weekcontent)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Week Content.",
      });
    });
};

// Find a single WeekContent with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  WeekContent.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find WeekContent with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving WeekContent with id=" + id
      });
    });
};

// Retrieve all week contents from the database.
exports.findAll = (req, res) => {
  const week_number = req.query.week_number;
  let condition = week_number
    ? { week_number: { [Op.eq]: `${week_number}` } }
    : null;

  WeekContent.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving week contents.",
      });
    });
};

// Delete a week of contents from the database.
exports.delete = (req, res) => {
  const id = req.params.id;

  WeekContent.destroy({ where: { id: id } })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Week was deleted successfully!",
        });
      } else {
        res.send({
            message: `Cannot delete Week with id=${id}. Maybe Week was not found!`,
          });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Could not delete Week with id=" + id,
      });
    });
};
