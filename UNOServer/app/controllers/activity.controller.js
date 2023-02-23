const { sequelize } = require("../models");
const db = require("../models");
const Activity = db.activities;
const ActivityGroup = db.activitygroups;
const Op = db.Sequelize.Op;

// Create and Save a new Activity
exports.create = async (req, res) => {
  // Validate request
  if (
    !req.body.activitygroup_id ||
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

  // Check if ActivityGroup exists
  let activitygroup = await ActivityGroup.findOne({
    where: {
      id: req.body.activitygroup_id,
      class_id: req.params.class_id,
    },
  });
  if (activitygroup === null) {
    res.status(400).send({
      message: "You're not the teacher of this ActivityGroup.",
    });
    return;
  }

  // Get number of activity
  let activities_data;
  try {
    activities_data = await Activity.findAll({
      order: [["order", "DESC"]],
      include: [
        {
          model: ActivityGroup,
          as: "activitygroup",
          where: { class_id: req.params.class_id, id: req.body.activitygroup_id },
        },
      ],
    });
  } catch (e) {
    console.log(e);
  }
  let activity_number = 1;
  if (activities_data.length !== 0)
    activity_number = activities_data[0].dataValues.order + 1;

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
    order: activity_number,
    activitygroup_id: req.body.activitygroup_id,
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
        model: ActivityGroup,
        as: "activitygroup",
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

// Retrieve all activities from the database.
exports.findAll = (req, res) => {
  const activitygroup_id = req.query.activitygroup_id;

  Activity.findAll({
    include: [
      {
        model: ActivityGroup,
        as: "activitygroup",
        where: {
          id: activitygroup_id,
          class_id: req.params.class_id,
        },
      },
    ],
    order: [
      ["order", "ASC"]
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
        model: ActivityGroup,
        as: "activitygroup",
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

// Update the order of all activities of a activitygroup
exports.change_order = async (req, res) => {
  const new_order = req.body.new_order;
  const activitygroup_id = req.body.activitygroup_id;

  if (!new_order || !activitygroup_id) {
    res.status(400).send({
      message: "new_order and activitygroup_id can not be empty!",
    });
    return;
  }

  // Check new order
  const _old_order = await Activity.findAll({
    where: {
      activitygroup_id: activitygroup_id
    },
    order: [
      ["order", "ASC"]
    ],
    attributes: ["id"],
    raw: true
  });
  if (_old_order.length < 2) {
    res.status(400).send({
      message: "Impossible to reorder, there are only zero or one Activities!",
    });
    return;
  }
  const old_order = _old_order.map((item) => item.id);
  let sorted_new_order = [...new_order].sort();
  if (old_order.sort().join(",") !== sorted_new_order.join(",")) {
    res.status(400).send({
      message: "Wrong Activities ids.",
    });
    return;
  }

  try {
    await sequelize.transaction(async (t) => {
      let order = 1;
      for (let activity_id of new_order) {
        await Activity.update(
          { order: order}, 
          { where: { id: activity_id }, transaction: t});
        order++;
      }
    })

    res.send({
      message: `Order was changed successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not change order of Activities.",
    });
  }
}

// Delete a activity from the database.
exports.delete = async (req, res) => {
  const id = req.params.id;
  const activitygroup_id = req.body.activitygroup_id;

  try {
    const result = await sequelize.transaction(async (t) => {
      // Get the activity number of the activity to be deleted
      const activity_to_delete = await Activity.findOne(
        {
          where: { id: id },
          include: [
            {
              model: ActivityGroup,
              as: "activitygroup",
              where: { id: activitygroup_id, class_id: req.params.class_id },
            },
          ],
        },
        { transaction: t }
      );
      if (activity_to_delete === null)
        throw new Error(
          `Cannot delete Activity with id=${id}. Maybe Activity was not found!`
        );
      const activity_number_to_delete = activity_to_delete.order;

      // Delete the activity
      await activity_to_delete.destroy({
        transaction: t,
      });

      // Get the activities that had a higher order to update them
      const remaining_activities = await Activity.findAll({
        where: {
          order: { [Op.gt]: `${activity_number_to_delete}` },
          activitygroup_id: activitygroup_id,
        },
        transaction: t,
      });

      // Update each activity_number by decreasing one
      for (let idx in remaining_activities) {
        let activity = remaining_activities[idx];
        await Activity.update(
          { order: activity.order - 1 },
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
