const db = require("../models");
const config = require("../config/auth.config");
const User = db.users;
const Role = db.roles;
const Class = db.classes;
const ClassUser = db.classusers;

const Op = db.Sequelize.Op;

let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

exports.signupStudent = (req, res) => {
  if (
    !req.body.first_name ||
    !req.body.last_name ||
    !req.body.email ||
    !req.body.password ||
    !req.body.class_code
  ) {
    res.status(400).send({
      message:
        "Error. first_name, last_name, email, password and class_code body parameters are required.",
    });
    return;
  }

  const class_code = req.body.class_code;

  // Check if Class code exists
  Class.findOne({
    where: {
      code: class_code,
    },
  })
    .then((class_entry) => {
      console.log(class_entry);
      if (class_entry) {
        const newUser = {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 8),
        };

        // Save User to Database
        User.create(newUser).then((user) => {
          // Set student Role
          user.setRoles([1]).then(() => {
            // Assign user to class
            ClassUser.create({
              UserId: user.id,
              ClassId: class_entry.id,
              user_type: "student",
            }).then(() => {
              res.send({ message: "User was registered successfully!" });
            });
          });
        });
      } else {
        res.status(400).send({ message: "Invalid class code." });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.signupTeacher = (req, res) => {
  const newUser = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  };

  // Save User to Database
  User.create(newUser)
    .then((user) => {
      // Set teacher Role
      user.setRoles([2]).then(() => {
        res.send({ message: "User was registered successfully!" });
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      let passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      let token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400, // 24 hours
      });

      user.getRoles().then((roles) => {
        req.session.token = token;
        
        if (roles[0].name === "student") {
          ClassUser.findAll({
            where: {
              userId: user.id,
            },
          }).then((classuser_item) => {
            res.status(200).send({
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              instrument: user.instrument,
              class_id: classuser_item[0].ClassId,
            });
          });
        } else {
          res.status(200).send({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            instrument: user.instrument,
          });
        }
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({
      message: "You've been signed out!",
    });
  } catch (err) {
    this.next(err);
  }
};
