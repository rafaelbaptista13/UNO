const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const AWS = require('aws-sdk');
require('dotenv').config();
const s3Config = require("./app/config/s3.config");

const app = express();

let corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "uno-session",
    // keys: ['key1', 'key2'],
    secret: "COOKIE_SECRET", // should use as secret environment variable
    httpOnly: true,
  })
);

const s3 = new AWS.S3(s3Config);

app.use((req, res, next) => {
  req.s3 = s3;
  next();
})

const db = require("./app/models");

const Role = db.roles;
const ActivityType = db.activitytypes;
const GameMode = db.gamemodes;

async function synchronize() {
  try {
    await db.sequelize.sync();
    await Role.findOrCreate({
      where: {
        id: 1,
      },
      defaults: {
        name: "student",
      },
    });

    await Role.findOrCreate({
      where: {
        id: 2,
      },
      defaults: {
        name: "teacher",
      },
    });

    // Create activity types
    await ActivityType.findOrCreate({
      where: {
        id: 1,
      },
      defaults: {
        name: "Media"
      }
    });

    await ActivityType.findOrCreate({
      where: {
        id: 2,
      },
      defaults: {
        name: "Exercise"
      }
    });

    await ActivityType.findOrCreate({
      where: {
        id: 3,
      },
      defaults: {
        name: "Question"
      }
    });

    await ActivityType.findOrCreate({
      where: {
        id: 4,
      },
      defaults: {
        name: "Game"
      }
    });

    await GameMode.findOrCreate({
      where: {
        id: 1,
      },
      defaults: {
        name: "Identify"
      }
    });

    await GameMode.findOrCreate({
      where: {
        id: 2,
      },
      defaults: {
        name: "Play"
      }
    });

    await GameMode.findOrCreate({
      where: {
        id: 3,
      },
      defaults: {
        name: "Build"
      }
    });
    
    console.log("Synced db.");
  } catch (err) {
    console.log("Failed to sync db: " + err.message);
  }
}

synchronize();

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to rafael application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/class.routes")(app);
require("./app/routes/activitygroup.routes")(app);
require("./app/routes/activity.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
