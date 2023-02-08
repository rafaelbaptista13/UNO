const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.users;

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.userId = decoded.id;
    next();
  });
};

const isStudent = (req, res, next) => {
  User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (const element of roles) {
        if (element.name === "student") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Student Role!",
      });
    });
  });
};

const isTeacher = (req, res, next) => {
  User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (const element of roles) {
        if (element.name === "teacher") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Teacher Role!",
      });
    });
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isStudent: isStudent,
  isTeacher: isTeacher,
};
module.exports = authJwt;
