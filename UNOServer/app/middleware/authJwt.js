const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.users;
const ClassUsers = db.classusers;

const verifyToken = (req, res, next) => {
  let token = req.session.token;

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

const isTeacherOfRequestedClass = (req, res, next) => {
  const id = req.params.class_id;
  // Verify if user is the teacher of the requested class
  ClassUsers.findOne({
    where: {
      ClassId: id,
      UserId: req.userId,
    },
  }).then((userclass) => {
    if (userclass !== null) {
      if (userclass.user_type === "Teacher") {
        next();
        return;
      }
    }

    res.status(403).send({
      message: "You're not the teacher of this class!",
    });
  });
};

const isPartOfRequestedClass = (req, res, next) => {
  const id = req.params.class_id;
  // Verify if user is the teacher of the requested class
  ClassUsers.findOne({
    where: {
      ClassId: id,
      UserId: req.userId,
    },
  }).then((userclass) => {
    if (userclass !== null) {
      next();
      return;
    }

    res.status(403).send({
      message: "You're not a student of this class!",
    });
  });
};

const isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then((user) => {
    user.getRoles().then((roles) => {
      for (const element of roles) {
        if (element.name === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Admin Role!",
      });
    });
  });
};

const decodeToken = (req, res, next) => {
  let token = req.session.token;

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    req.userId = decoded.id;
    next();
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isStudent: isStudent,
  isTeacher: isTeacher,
  isTeacherOfRequestedClass: isTeacherOfRequestedClass,
  isPartOfRequestedClass: isPartOfRequestedClass,
  isAdmin: isAdmin,
  decodeToken: decodeToken
};
module.exports = authJwt;
