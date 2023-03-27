const { sequelize, buildmodestatus } = require("../models");
const db = require("../models");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const Activity = db.activities;
const ActivityGroup = db.activitygroups;
const PlayMode = db.playmode;
const GameActivity = db.gameactivities;
const MusicalNote = db.musicalnotes;
const PlayModeStatus = db.playmodestatus;
const IdentifyMode = db.identifymode;
const IdentifyModeStatus = db.identifymodestatus;
const BuildMode = db.buildmode;
const BuildModeStatus = db.buildmodestatus;

// Create and Save a new Activity of type Game
exports.createGame = async (req, res) => {
  const gamemode = req.body.mode;
  // Validate request
  if (!req.body.activitygroup_id || !req.body.mode || !req.body.notes) {
    res.status(400).send({
      message:
        "Content can not be empty! Define a activitygroup_id, mode and notes body.",
    });
    return;
  }
  if (gamemode !== "Identify" && gamemode !== "Play" && gamemode !== "Build") {
    res.status(400).send({
      message: "Invalid game mode. It must be Identify, Play or Build.",
    });
    return;
  }

  // Check if ActivityGroup exists
  let activitygroup = await ActivityGroup.findOne({
    where: {
      id: req.body.activitygroup_id,
      class_id: req.params.class_id,
    },
  });
  if (activitygroup === null) {
    res.status(400).send({
      message: "You're not the teacher of this ActivityGroup.",
    });
    return;
  }

  // Get number of activity
  let activities_data;
  try {
    activities_data = await Activity.findAll({
      order: [["order", "DESC"]],
      include: [
        {
          model: ActivityGroup,
          as: "activitygroup",
          where: {
            class_id: req.params.class_id,
            id: req.body.activitygroup_id,
          },
        },
      ],
    });
  } catch (e) {
    console.log(e);
  }
  let order = 1;
  if (activities_data.length !== 0)
    order = activities_data[0].dataValues.order + 1;

  let notes = [];
  for (let idx in req.body.notes) {
    let note = req.body.notes[idx];

    // Validate note
    if (
      note.violin_string < 1 ||
      note.violin_string > 4 ||
      note.violin_finger < 1 ||
      note.violin_finger > 5 ||
      note.viola_finger < 1 ||
      note.viola_finger > 5 ||
      note.viola_string < 1 ||
      note.viola_string > 4 ||
      (note.type !== "Circle" &&
        note.type !== "RightTriangle" &&
        note.type !== "LeftTriangle")
    ) {
      res.status(400).send({
        message: "Invalid note.",
      });
      return;
    }

    const _note = {
      order: idx,
      name: note.name,
      violin_string: note.violin_string,
      violin_finger: note.violin_finger,
      viola_string: note.viola_string,
      viola_finger: note.viola_finger,
      note_code: note.note_code,
      type: note.type,
    };
    notes.push(_note);
  }
  
  let GameModeModel;
  let activity;
  // Create an Activity
  if (gamemode === "Identify") {
    activity = {
      order: order,
      activitygroup_id: req.body.activitygroup_id,
      title: "A Cor do Som",
      description: req.body.description,
      activitytype_id: 4, // Game
      GameActivity: {
        gamemode_id: 1, // IdentifyMode
        IdentifyMode: {},
        MusicalNotes: notes,
      },
    };
    GameModeModel = IdentifyMode;
  } else if (gamemode === "Play") {
    activity = {
      order: order,
      activitygroup_id: req.body.activitygroup_id,
      title: "A Cor do Som",
      description: req.body.description,
      activitytype_id: 4, // Game
      GameActivity: {
        gamemode_id: 2, // PlayMode
        PlayMode: {},
        MusicalNotes: notes,
      },
    };
    GameModeModel = PlayMode;
  } else if (gamemode === "Build") {
    if (!req.body.sequence_length) {
      res.status(400).send({
        message: "No sequence_length found in body. In Build game mode you need to define a sequence_length.",
      });
      return;
    }
    activity = {
      order: order,
      activitygroup_id: req.body.activitygroup_id,
      title: "A Cor do Som",
      description: req.body.description,
      activitytype_id: 4, // Game
      GameActivity: {
        gamemode_id: 3, // BuildMode
        BuildMode: {
          sequence_length: req.body.sequence_length
        },
        MusicalNotes: notes,
      },
    };
    GameModeModel = BuildMode;
  }

  // Save Activity in the database
  Activity.create(activity, {
    include: {
      model: GameActivity,
      include: [
        {
          model: GameModeModel,
        },
        {
          model: MusicalNote
        }
      ],
    },
  })
    .then((data) => {
      const filtered_data = {
        id: data.id,
        order: data.order,
        title: data.title,
        activitytype_id: data.activitytype_id,
        activitygroup_id: data.activitygroup_id,
      };
      res.send(filtered_data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Activity.",
      });
    });
};

// Submit Game of type Play
exports.submitGamePlay = async (req, res) => {
  const class_id = req.params.class_id;
  const activity_id = req.params.activity_id;
  const user_id = req.userId;

  if (!req.file) {
    res.status(400).send({
      message: "Content can not be empty! Define a media in form-data.",
    });
    return;
  }

  // Check if Activity exists
  let activity = await Activity.findOne({
    where: {
      id: activity_id,
    },
    include: [
      {
        model: GameActivity,
      },
      {
        model: ActivityGroup,
        as: "activitygroup",
        where: {
          class_id: class_id,
        },
      },
    ],
  });
  if (activity === null) {
    res.status(400).send({
      message: "Activity not found!",
    });
    return;
  }
  // Check activity type
  if (activity.activitytype_id !== 4) {
    res.status(400).send({
      message: "Activity is not of type Game!",
    });
    return;
  }
  if (activity.GameActivity.gamemode_id !== 2) {
    res.status(400).send({
      message: "GameActivity is not of type Play!",
    });
    return;
  }

  // Save media type
  const media_type = req.file.mimetype;
  const secret_key = crypto.randomBytes(16).toString("hex");
  // Encrypt file
  const encryptedFile = CryptoJS.AES.encrypt(
    req.file.buffer.toString("base64"),
    secret_key
  );

  // Generate file name
  const file_name = uuidv4();
  try {
    // Upload file in AWS S3 bucket
    const params = {
      Bucket: "violuno",
      Key: file_name,
      Body: encryptedFile.toString(),
    };

    await req.s3.upload(params).promise();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error uploading file");
    return;
  }

  const data = await PlayModeStatus.findOne({
    where: {
      activity_id: activity_id,
      user_id: user_id,
    },
  });
  if (data === null) {
    // Create new instance
    // Create PlayModeStatus
    const play_mode_status = {
      activity_id: activity_id,
      user_id: user_id,
      media_id: file_name,
      media_type: media_type,
      media_secret: secret_key,
    };

    PlayModeStatus.create(play_mode_status)
      .then(() => {
        res.send({
          message: "Game submitted successfully",
        });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while creating the PlayModeStatus.",
        });
      });
  } else {
    // Update the video submitted
    data
      .update({
        media_id: file_name,
        media_type: media_type,
        media_secret: secret_key,
      })
      .then(() => {
        res.send({
          message: "Game submitted successfully",
        });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while updating the PlayModeStatus.",
        });
      });
  }
};

// Get Media from Game Activity
exports.getSubmittedMedia = async (req, res) => {
  const class_id = req.params.class_id;
  const activity_id = req.params.activity_id;

  // Check if Activity exists
  let activity = await Activity.findOne({
    where: {
      id: activity_id,
    },
    include: [
      {
        model: GameActivity,
      },
      {
        model: ActivityGroup,
        as: "activitygroup",
        where: {
          class_id: class_id,
        },
      },
    ],
  });
  if (activity === null) {
    res.status(400).send({
      message: "Activity not found!",
    });
    return;
  }
  // Check activity type
  if (activity.activitytype_id !== 4) {
    res.status(400).send({
      message: "Activity is not of type Game!",
    });
    return;
  }
  if (
    activity.GameActivity.gamemode_id !== 2 &&
    activity.GameActivity.gamemode_id !== 3
  ) {
    res.status(400).send({
      message:
        "GameActivity is not of type Play or Build. So, there's no media submitted!",
    });
    return;
  }

  let media_type;
  let media_id;
  let media_secret;

  if (activity.GameActivity.gamemode_id === 2) {
    let play_mode_activity = await PlayMode.findOne({
      where: {
        activity_id: activity_id,
      },
      include: [
        {
          model: PlayModeStatus,
          where: {
            activity_id: activity_id,
            user_id: req.userId,
          },
        },
      ],
    });
    if (play_mode_activity === null) {
      res.status(400).send({
        message: "Activity not submitted!",
      });
      return;
    }

    media_type = play_mode_activity.PlayModeStatus.media_type;
    media_id = play_mode_activity.PlayModeStatus.media_id;
    media_secret = play_mode_activity.PlayModeStatus.media_secret;
  } else if (activity.GameActivity.gamemode_id === 3) {
    let build_mode_activity = await BuildMode.findOne({
      where: {
        activity_id: activity_id
      },
      include: [
        {
          model: BuildModeStatus,
          where: {
            activity_id: activity_id,
            user_id: req.userId
          }
        }
      ]
    })
    if (build_mode_activity === null) {
      res.status(400).send({
        message: "Activity not submitted!",
      });
      return;
    }

    media_type = build_mode_activity.BuildModeStatus.media_type;
    media_id = build_mode_activity.BuildModeStatus.media_id;
    media_secret = build_mode_activity.BuildModeStatus.media_secret;
  }

  // Get Media from aws s3
  const s3Object = await req.s3
    .getObject({
      Bucket: "violuno",
      Key: media_id,
    })
    .promise();

  // Decrypt
  const decryptedFile = CryptoJS.AES.decrypt(
    s3Object.Body.toString(),
    media_secret
  );

  res.set("Content-Type", media_type);
  res
    .status(200)
    .send(Buffer.from(decryptedFile.toString(CryptoJS.enc.Utf8), "base64"));
};

// Submit Game of type Identify
exports.submitGameIdentify = async (req, res) => {
  const class_id = req.params.class_id;
  const activity_id = req.params.activity_id;
  const user_id = req.userId;

  // Check if Activity exists
  let activity = await Activity.findOne({
    where: {
      id: activity_id,
    },
    include: [
      {
        model: GameActivity,
      },
      {
        model: ActivityGroup,
        as: "activitygroup",
        where: {
          class_id: class_id,
        },
      },
    ],
  });
  if (activity === null) {
    res.status(400).send({
      message: "Activity not found!",
    });
    return;
  }
  // Check activity type
  if (activity.activitytype_id !== 4) {
    res.status(400).send({
      message: "Activity is not of type Game!",
    });
    return;
  }
  if (activity.GameActivity.gamemode_id !== 1) {
    res.status(400).send({
      message: "GameActivity is not of type Identify!",
    });
    return;
  }

  IdentifyModeStatus.findOrCreate({
    where: {
      activity_id: activity_id,
      user_id: user_id,
    },
    defaults: {
      activity_id: activity_id,
      user_id: user_id,
    },
  })
    .then(() => {
      res.send({
        message: "Game submitted successfully",
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while creating the IdentifyModeStatus.",
      });
    });
};
