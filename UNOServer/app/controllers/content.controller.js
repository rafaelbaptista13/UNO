const { sequelize } = require("../models");
const db = require("../models");
const WeekContent = db.weekcontents;
const Op = db.Sequelize.Op;

// Create and Save a new Content
exports.create = async (req, res) => {
  // Validate request
  if (
    req.body.number_of_videos === undefined ||
    req.body.number_of_exercises === undefined
  ) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Get number of weekContent
  let weekcontent_data;
  try {
    weekcontent_data = await WeekContent.findAll({
      order: [["week_number", "DESC"]],
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
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find WeekContent with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving WeekContent with id=" + id,
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
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await sequelize.transaction(async (t) => {
      // Get the week number of the week to be deleted
      const week_to_delete = await WeekContent.findByPk(id, { transaction: t });
      const week_number_to_delete = week_to_delete.week_number;

      // Delete the week
      const num_of_deleted_week = await WeekContent.destroy(
        { where: { id: id } },
        { transaction: t }
      );
      if (num_of_deleted_week !== 1) {
        throw new Error(
          `Cannot delete Week with id=${id}. Maybe Week was not found!`
        );
      }

      // Get the weeks that had a higher week_number to update them
      const remaining_weeks = await WeekContent.findAll(
        { where: { week_number: { [Op.gt]: `${week_number_to_delete}` } } },
        { transaction: t }
      );

      // Update each week_number by decreasing one
      for (let idx in remaining_weeks) {
        let week = remaining_weeks[idx];
        await WeekContent.update(
          { week_number: week.week_number - 1 },
          { where: { id: week.id } },
          { transaction: t }
        );
      }

      return week_to_delete;
    });

    res.send({
      message: `Week with id=${result.id} was deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not delete Week with id=" + id,
    });
  }
};
