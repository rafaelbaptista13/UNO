const { sequelize } = require("../models");
const db = require("../models");
const User = db.users;
const Trophy = db.trophies;
const ClassUsers = db.classusers;
const Role = db.roles;
const Op = db.Sequelize.Op;

// Retrieve the trophies a user does not has yet 
exports.getUserAvailableTrophies = async (req, res) => {
  const class_id = req.params.class_id;
  const user_id = req.params.student_id;

  // Get student
  let student;
  try {
    student = await User.findOne({
      attributes: ["id", "first_name", "last_name"],
      where: { id: user_id },
      include: [
        {
          model: Role,
          where: {
            name: "student",
          },
          attributes: [],
        },
      ],
    });

    let class_entry = await ClassUsers.findOne({
      where: {
        ClassId: class_id,
        UserId: user_id
      }
    });
    if (!class_entry) {
      res.status(403).send({
        message: "The student is not from this class!",
      });
      return;
    }

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "An error occured.",
    });
    return;
  }

  if (!student) {
    res.status(400).send({
      message: `User is not a student.`,
    });
    return
  } else {
    const user_trophies = await student.getTrophies();

    const availableTrophies = await Trophy.findAll({
      where: {
        id: {
          [db.Sequelize.Op.notIn]: user_trophies.map((trophy) => trophy.id),
        },
      },
    });

    res.send(availableTrophies);
  }
};

// Retrieve all trophies a user has
exports.getUserTrophies = async (req, res) => {
  const user_id = req.userId;

  // Get student
  let student;
  try {
    student = await User.findOne({
      attributes: ["id", "first_name", "last_name"],
      where: { id: user_id },
      include: [
        {
          model: Role,
          where: {
            name: "student",
          },
          attributes: [],
        },
      ],
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "An error occured.",
    });
    return;
  }

  if (!student) {
    res.status(400).send({
      message: `User is not a student.`,
    });
    return
  } else {
    const trophies = await student.getTrophies();
    res.send(trophies);
  }
};
