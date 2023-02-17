const db = require("../models");
const Class = db.classes;
const User = db.users;
const ClassUsers = db.classusers;

// Create and Save a new Class
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Get user
  const user = await User.findByPk(req.userId);

  // Create a Class
  const new_class = {
    name: req.body.name,
  };

  Class.create(new_class)
    .then(async (data) => {
      await data.addUser(user, { through: { user_type: "Teacher" } });
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Class.",
      });
    });
};

// Retrieve a Class and its users from the database.
exports.findOne = async (req, res) => {
  const id = req.params.class_id;

  Class.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name", "email", "instrument"],
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving the Class.",
      });
    });
};

// Retrieve all the Classes of a teacher from the database.
exports.findAll = async (req, res) => {
  Class.findAll({
    include: [
      {
        model: User,
        where: { id: req.userId },
        attributes: ["id", "first_name", "last_name", "email", "instrument"],
      },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Classes.",
      });
    });
};

// Update a Class by the id in the request
exports.update = async (req, res) => {
  const id = req.params.class_id;

  Class.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Class was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Class with id=${id}. Maybe Class was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Class with id=" + id,
      });
    });
};

// Delete a Class from the database
exports.delete = async (req, res) => {
  const id = req.params.class_id;

  Class.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Class was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Class with id=${id}. Maybe Class was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Class with id=" + id,
      });
    });
};
