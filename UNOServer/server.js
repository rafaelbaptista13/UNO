const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const AWS = require('aws-sdk');
require('dotenv').config();
const s3Config = require("./app/config/s3.config");
let bcrypt = require("bcryptjs");
const path = require('path');

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

app.use(express.static(path.join(__dirname, 'public')));

const s3 = new AWS.S3(s3Config);
const sns = new AWS.SNS(s3Config);

app.use((req, res, next) => {
  req.sns = sns;
  req.s3 = s3;
  next();
})

const db = require("./app/models");

const Role = db.roles;
const ActivityType = db.activitytypes;
const GameMode = db.gamemodes;
const User = db.users;
const Trophie = db.trophies;

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

    await Role.findOrCreate({
      where: {
        id: 3,
      },
      defaults: {
        name: "admin",
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

    let admin_account = await User.findOne({
      where: {
        first_name: "admin",
        last_name: "admin",
        email: "admin"
      },
      include: [{
        model: Role,
        where: {
          id: 3
        }
      }]
    }) 
    if (admin_account === null) {
      const admin = {
        first_name: "admin",
        last_name: "admin",
        email: "admin",
        password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 8),
      }
      const admin_user = await User.create(admin);
      await admin_user.setRoles([3])
      console.log("Create admin user");
    }

    await Trophie.findOrCreate({
      where: {
        id: 1,
      },
      defaults: {
        name: "Uau, estás a arrasar!"
      }
    });

    await Trophie.findOrCreate({
      where: {
        id: 2,
      },
      defaults: {
        name: "Muito bem, estás a caprichar!"
      }
    });

    await Trophie.findOrCreate({
      where: {
        id: 3,
      },
      defaults: {
        name: "Boa, estás a ir bem!"
      }
    });

    await Trophie.findOrCreate({
      where: {
        id: 4,
      },
      defaults: {
        name: "Parabéns, continua a praticar!"
      }
    });

    await Trophie.findOrCreate({
      where: {
        id: 5,
      },
      defaults: {
        name: "Viva, segue assim, mas ainda há trabalho!"
      }
    });

    await Trophie.findOrCreate({
      where: {
        id: 6,
      },
      defaults: {
        name: "Isso, deste um salto!"
      }
    });

    await Trophie.findOrCreate({
      where: {
        id: 7,
      },
      defaults: {
        name: "Vamos, mais um pouco vais arrasar!"
      }
    });

    await Trophie.findOrCreate({
      where: {
        id: 8,
      },
      defaults: {
        name: "Vais bem, mas atenção, precisas continuar!"
      }
    });

    await Trophie.findOrCreate({
      where: {
        id: 9,
      },
      defaults: {
        name: "Vá em frente, estás no caminho!"
      }
    });

    await Trophie.findOrCreate({
      where: {
        id: 10,
      },
      defaults: {
        name: "Vamos, o caminho é praticar!"
      }
    });

    await Trophie.findOrCreate({
      where: {
        id: 11,
      },
      defaults: {
        name: "Vá em frente, é mais simples do que parece!"
      }
    });

    await Trophie.findOrCreate({
      where: {
        id: 12,
      },
      defaults: {
        name: "Avante, tocar requer prática!"
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
require("./app/routes/supportmaterial.routes")(app);
require("./app/routes/admin.routes")(app);
require("./app/routes/trophies.routes")(app);
require("./app/routes/public.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
