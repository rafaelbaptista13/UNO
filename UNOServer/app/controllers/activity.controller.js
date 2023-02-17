const { sequelize } = require("../models");
const db = require("../models");
const Activity = db.activities;
const WeekContent = db.weekcontents;
const Class = db.classes;
const Op = db.Sequelize.Op;

// Create and Save a new Activity
exports.create = async (req, res) => {
  // Validate request
  if (
    !req.body.weekcontent_id ||
    !req.body.type ||
    (!req.body.title && !["game", "question"].includes(req.body.type))
  ) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Check activity type
  if (
    !["video", "exercise", "game", "audio", "question"].includes(req.body.type)
  ) {
    res.status(400).send({
      message:
        "Invalid activity type. Must be a video, exercise, game, audio or question.",
    });
    return;
  }

  // Check if weekcontent exists
  let weekcontent = await WeekContent.findOne({
    where: {
      id: req.body.weekcontent_id,
      class_id: req.params.class_id,
    },
  });
  if (weekcontent === null) {
    res.status(400).send({
      message: "You're not the teacher of this WeekContent.",
    });
    return;
  }

  // Get number of activity
  let activities_data;
  try {
    activities_data = await Activity.findAll({
      order: [["activity_number", "DESC"]],
      includes: {
        model: WeekContent,
        where: { class_id: req.params.class_id, id: req.body.weekcontent_id },
      },
    });
  } catch (e) {
    console.log(e);
  }
  let activity_number = 1;
  if (activities_data.length !== 0)
    activity_number = activities_data[0].dataValues.activity_number + 1;

  // Set Title
  let title = req.body.title;
  if (req.body.type === "question") {
    title = "Pergunta";
  }
  if (req.body.type === "game") {
    title = "Jogo A Cor do Som";
  }

  // Create a Activity
  const activity = {
    type: req.body.type,
    activity_number: activity_number,
    weekcontent_id: req.body.weekcontent_id,
    title: title,
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

  Activity.findOne({
    where: {
      id: id,
    },
    include: [
      {
        model: WeekContent,
        as: "weekcontent",
        where: { class_id: req.params.class_id },
      },
    ],
  })
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

  Activity.findAll({
    include: [
      {
        model: WeekContent,
        as: "weekcontent",
        where: {
          id: weekcontent_id,
          class_id: req.params.class_id,
        },
      },
    ],
  })
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

// Update a Activity by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  // Find Activity
  Activity.findOne({
    where: { id: id },
    include: [
      {
        model: WeekContent,
        as: "weekcontent",
        where: { class_id: req.params.class_id },
      },
    ],
  })
    .then((activity) => {
      if (activity === null) throw new Error();
      activity.update(req.body).then((num) => {
        res.send({
          message: "Activity was updated successfully.",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Error updating Activity with id=" + id,
      });
    });
};

// Delete a activity from the database.
exports.delete = async (req, res) => {
  const id = req.params.id;
  const weekcontent_id = req.body.weekcontent_id;

  try {
    const result = await sequelize.transaction(async (t) => {
      // Get the activity number of the activity to be deleted
      const activity_to_delete = await Activity.findOne(
        {
          where: { id: id },
          include: [
            {
              model: WeekContent,
              as: "weekcontent",
              where: { id: weekcontent_id, class_id: req.params.class_id },
            },
          ],
        },
        { transaction: t }
      );
      if (activity_to_delete === null)
        throw new Error(
          `Cannot delete Activity with id=${id}. Maybe Activity was not found!`
        );
      const activity_number_to_delete = activity_to_delete.activity_number;

      // Delete the activity
      await activity_to_delete.destroy({
        transaction: t,
      });

      // Get the activities that had a higher activity_number to update them
      const remaining_activities = await Activity.findAll({
        where: {
          activity_number: { [Op.gt]: `${activity_number_to_delete}` },
          weekcontent_id: weekcontent_id,
        },
        transaction: t,
      });

      // Update each activity_number by decreasing one
      for (let idx in remaining_activities) {
        let activity = remaining_activities[idx];
        await Activity.update(
          { activity_number: activity.activity_number - 1 },
          { where: { id: activity.id }, transaction: t }
        );
      }

      return activity_to_delete;
    });

    res.send({
      message: `Activity with id=${result.id} was deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not delete Activity with id=" + id,
    });
  }
};
