const { sequelize } = require("../models");
const db = require("../models");
const ActivityGroup = db.activitygroups;
const Activity = db.activities;
const CompletedActivity = db.completedactivities;
const Class = db.classes;
const Role = db.roles;
const User = db.users;
const ActivityType = db.activitytypes;
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
          err.message ||
          "Some error occurred while creating the ActivityGroup.",
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

  ActivityGroup.update(
    {
      name: newName,
    },
    {
      where: { id: id },
    }
  )
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

// Update the order of all ActivityGroups
exports.change_order = async (req, res) => {
  const new_order = req.body.new_order;

  if (!new_order) {
    res.status(400).send({
      message: "new_order can not be empty!",
    });
    return;
  }

  // Check new order
  const _old_order = await ActivityGroup.findAll({
    where: {
      class_id: req.params.class_id,
    },
    order: [
      ["order", "ASC"]
    ],
    attributes: ["id"],
    raw: true
  });
  if (_old_order.length < 2) {
    res.status(400).send({
      message: "Impossible to reorder, there are only zero or one ActivityGroup!",
    });
    return;
  }
  const old_order = _old_order.map((item) => item.id);
  let sorted_new_order = [...new_order].sort();
  if (old_order.sort().join(",") !== sorted_new_order.join(",")) {
    res.status(400).send({
      message: "Wrong ActivityGroups ids.",
    });
    return;
  }

  try {
    await sequelize.transaction(async (t) => {
      let order = 1;
      for (let activitygroup_id of new_order) {
        await ActivityGroup.update(
          { order: order}, 
          { where: { id: activitygroup_id }, transaction: t});
        order++;
      }
    })

    res.send({
      message: `Order was changed successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not change order of ActivityGroups.",
    });
  }
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
    order: [
      ["order", "ASC"]
    ]
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


// Retrieve all students that belong to this activitygroup and their progress
exports.getStudentsFromActivityGroup = async (req, res) => {
  const activitygroup_id = req.params.activitygroup_id;
  const class_id = req.params.class_id;

  // Get students
  let students;
  try {
    students = await User.findAll({
      attributes: ["id", "first_name", "last_name"],
      include: [
        {
          model: Class,
          where: {
            id: class_id,
          },
          attributes: []
        },
        {
          model: Role,
          where: {
            name: "student"
          },
          attributes: []
        }
      ]
    })
  } catch (error) {
    console.log(error);
  }
  
  let _students = students.map(student => student.toJSON());
  for (let idx in _students) {
    _students[idx].completed = 0;
  }
  const final_data = {students: _students};

  Activity.findAll({
    include: [
      {
        model: ActivityGroup,
        as: "activitygroup",
        where: {
          id: activitygroup_id,
          class_id: class_id,
        },
      },
      {
        model: ActivityType,
        as: "activitytype",
      },
    ],
    order: [["order", "ASC"]],
  })
    .then(async (_data) => {
      final_data.total_activities = _data.length;
      if (final_data.total_activities !== 0) {
        final_data.name = _data[0].activitygroup.name;
        for (let idx in _data) {
          let activity = _data[idx].toJSON();

          for (let student_idx in students) {
            let student_id = students[student_idx].id;
            let completed_activity = await CompletedActivity.findOne({
              where: {
                activity_id: activity.id,
                user_id: student_id,
              }
            })
            if (completed_activity !== null) {
              final_data.students[student_idx].completed++;
            }
          }
        }
      }
      res.send(final_data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Activities.",
      });
    });
};