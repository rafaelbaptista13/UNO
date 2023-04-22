const db = require("../models");
const User = db.users;
let bcrypt = require("bcryptjs");

// Change user password
exports.change_password = (req, res) => {
  const new_password = req.body.new_password;
  const user_id = req.params.user_id;
  
  if (!new_password) {
    res.status(400).send({
      message: "Error. new_password body parameter is required.",
    });
    return;
  }

  User.update(
    {
      password: bcrypt.hashSync(new_password, 8),
    },
    {
      where: { id: user_id },
    }
  )
    .then((result) => {
      if (result == 1) {
        res.status(200).send({
          message: "User password changed successfully!",
        });
      } else {
        res.status(400).send({
          message: "Error. User not found.",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
