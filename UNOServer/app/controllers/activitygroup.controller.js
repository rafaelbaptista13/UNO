const { sequelize } = require("../models");
const db = require("../models");
const ActivityGroup = db.activitygroups;
const Op = db.Sequelize.Op;

// Create and Save a new ActivityGroup
exports.create = async (req, res) => {
  // Validate request
  if (
    req.body.name === undefined ||
    req.body.number_of_videos === undefined ||
    req.body.number_of_exercises === undefined
  ) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Get number of ActivityGroup
  let activitygroup_data;
  try {
    activitygroup_data = await ActivityGroup.findAll({
      order: [["order", "DESC"]],
      where: {
        class_id: req.params.class_id,
      },
    });
  } catch (e) {
    console.log(e);
  }

  let order = 1;
  if (activitygroup_data.length !== 0)
    order = activitygroup_data[0].dataValues.order + 1;

  // Create a ActivityGroup
  const activitygroup = {
    order: order,
    name: req.body.name,
    number_of_videos: req.body.number_of_videos,
    number_of_exercises: req.body.number_of_exercises,
    class_id: req.params.class_id,
  };

  // Save ActivityGroup in the database
  ActivityGroup.create(activitygroup)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the ActivityGroup.",
      });
    });
};

// Update a ActivityGroup by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  const newName = req.body.name;

  if (!newName) {
    res.status(400).send({
      message: "Name can not be empty!",
    });
    return;
  }

  ActivityGroup.update({
    name: newName
  }, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "ActivityGroup was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update ActivityGroup with id=${id}. Maybe ActivityGroup was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating ActivityGroup with id=" + id,
      });
    });
};


// Find a single ActivityGroup with an id
exports.findOne = (req, res) => {
  const id = req.params.activitygroup_id;

  ActivityGroup.findOne({
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
          message: `Cannot find ActivityGroup with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving ActivityGroup with id=" + id,
      });
    });
};

// Retrieve all ActivityGroups of a class
exports.findAll = (req, res) => {
  ActivityGroup.findAll({
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
          err.message || "Some error occurred while retrieving ActivityGroups.",
      });
    });
};

// Delete a ActivityGroup from the database.
exports.delete = async (req, res) => {
  const id = req.params.activitygroup_id;
  const class_id = req.params.class_id;

  try {
    const result = await sequelize.transaction(async (t) => {
      // Get the order of the ActivityGroup to be deleted
      const activitygroup_to_delete = await ActivityGroup.findOne(
        { where: { id: id, class_id: class_id } },
        { transaction: t }
      );
      if (activitygroup_to_delete === null)
        throw new Error(
          `Cannot delete ActivityGroup with id=${id}. Maybe ActivityGroup was not found!`
        );
      const order_to_delete = activitygroup_to_delete.order;

      // Delete the ActivityGroup
      await activitygroup_to_delete.destroy({
        transaction: t,
      });

      // Get the ActivityGroups that had a higher order to update them
      const remaining_activitygroups = await ActivityGroup.findAll(
        {
          where: {
            order: { [Op.gt]: `${order_to_delete}` },
            class_id: class_id,
          },
        },
        { transaction: t }
      );

      // Update each order by decreasing one
      for (let idx in remaining_activitygroups) {
        let activitygroup = remaining_activitygroups[idx];
        await ActivityGroup.update(
          { order: activitygroup.order - 1 },
          { where: { id: activitygroup.id }, transaction: t }
        );
      }

      return activitygroup_to_delete;
    });

    res.send({
      message: `ActivityGroup with id=${result.id} was deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not delete ActivityGroup with id=" + id,
    });
  }
};
