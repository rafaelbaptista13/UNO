const db = require("../models");
const Content = db.contents;
const Op = db.Sequelize.Op;

// Create and Save a new Content
exports.create = (req, res) => {
  // Validate request
  if (!req.body.week_number) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Create a Content
  const content = {
    week_number: req.body.week_number,
    number_of_videos: req.body.number_of_videos,
    number_of_exercises: req.body.number_of_exercises,
  };

  // Save Content in the database
  Content.create(content)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Content.",
      });
    });
};

// Retrieve all contents from the database.
exports.findAll = (req, res) => {
  const week_number = req.query.week_number;
  let condition = week_number
    ? { week_number: { [Op.eq]: `${week_number}` } }
    : null;

  Content.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving contents.",
      });
    });
};

// Delete a week of contents from the database.
exports.delete = (req, res) => {
  const id = req.params.id;

  Content.destroy({ where: { id: id } })
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
