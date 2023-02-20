const { sequelize } = require("../models");
const db = require("../models");
const WeekContent = db.weekcontents;
const Op = db.Sequelize.Op;
const ClassUsers = db.classusers;

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
      where: {
        class_id: req.params.class_id,
      },
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
    class_id: req.params.class_id,
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
  const id = req.params.weekcontent_id;

  WeekContent.findOne({
    where: {
      id: id,
      class_id: req.params.class_id,
    },
  })
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

// Retrieve all weeks of contents of a class
exports.findAll = (req, res) => {
  WeekContent.findAll({
    where: {
      class_id: req.params.class_id,
    },
  })
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
  const id = req.params.weekcontent_id;
  const class_id = req.params.class_id;

  try {
    const result = await sequelize.transaction(async (t) => {
      // Get the week number of the week to be deleted
      const week_to_delete = await WeekContent.findOne(
        { where: { id: id, class_id: class_id } },
        { transaction: t }
      );
      if (week_to_delete === null)
        throw new Error(
          `Cannot delete Week with id=${id}. Maybe Week was not found!`
        );
      const week_number_to_delete = week_to_delete.week_number;

      // Delete the week
      await week_to_delete.destroy({
        transaction: t,
      });

      // Get the weeks that had a higher week_number to update them
      const remaining_weeks = await WeekContent.findAll(
        { where: { week_number: { [Op.gt]: `${week_number_to_delete}` }, class_id: class_id } },
        { transaction: t }
      );

      // Update each week_number by decreasing one
      for (let idx in remaining_weeks) {
        let week = remaining_weeks[idx];
        await WeekContent.update(
          { week_number: week.week_number - 1 },
          { where: { id: week.id }, transaction: t }
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
