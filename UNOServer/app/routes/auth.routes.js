const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/student/signup",
    [
      verifySignUp.checkDuplicateEmail,
    ],
    controller.signupStudent
  );

  app.post(
    "/api/auth/teacher/signup",
    [
      verifySignUp.checkDuplicateEmail,
    ],
    controller.signupTeacher
  );

  app.post("/api/auth/signin", controller.signin);

  app.post("/api/auth/signout", controller.signout);
};
