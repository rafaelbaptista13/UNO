const db = require("../models");
const ROLES = db.ROLES;
const User = db.users;

const checkDuplicateEmail = (req, res, next) => {
  // Email
  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((user) => {
    if (user) {
      res.status(400).send({
        message: "Failed! Email is already in use!",
      });
      return;
    }

    next();
  });
};

const checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (const element of req.body.roles) {
      if (!ROLES.includes(element)) {
        res.status(400).send({
          message: "Failed! Role does not exist = " + element,
        });
        return;
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateEmail: checkDuplicateEmail,
  checkRolesExisted: checkRolesExisted,
};

module.exports = verifySignUp;
