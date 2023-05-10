const { sequelize } = require("../models");
const db = require("../models");
const User = db.users;
const Trophy = db.trophies;
const UserTrophies = db.usertrophies;
const Role = db.roles;

// Retrieve the trophies
exports.getAvailableTrophies = async (req, res) => {
  const availableTrophies = await Trophy.findAll();

  res.send(availableTrophies);
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
    //const trophies = await student.getTrophies();
    const user_trophies = await UserTrophies.findAll({
      where: {
        userId: user_id
      }
    });

    let trophies = [];
    for (let idx in user_trophies) {
      let user_trophy = user_trophies[idx];
      let trophy = await Trophy.findByPk(user_trophy.TrophyId);
      trophies.push({id: trophy.id, name: trophy.name, updatedAt: user_trophy.updatedAt, count: user_trophy.count})
    }

    res.send(trophies);
  }
};
