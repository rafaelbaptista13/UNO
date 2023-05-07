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
const UserChosenNotes = db.userchosennotes;
const User = db.users;
const CompletedActivity = db.completedactivities;
const Trophy = db.trophies;
const UserTrophies = db.usertrophies;

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
      note.violin_finger < 0 ||
      note.violin_finger > 4 ||
      note.viola_finger < 0 ||
      note.viola_finger > 4 ||
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
        message:
          "No sequence_length found in body. In Build game mode you need to define a sequence_length.",
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
          sequence_length: req.body.sequence_length,
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
          model: MusicalNote,
        },
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

// Update an Activity of type Game
exports.updateGame = async (req, res) => {
  const id = req.params.id;
  const class_id = req.params.class_id;
  const description = req.body.description;
  const notes = req.body.notes;
  const sequence_length = req.body.sequence_length;

  // Validate request
  if (typeof description !== "string" || !notes) {
    res.status(400).send({
      message:
        "Content can not be empty! Define the description, and notes parameters in body.",
    });
    return;
  }

  // Check if user has access to activity
  let activity = await Activity.findOne({
    where: {
      id: id,
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
      message: "You're not the teacher of this Activity.",
    });
    return;
  }

  // Check game mode Build
  if (activity.GameActivity.gamemode_id === 3 && !sequence_length) {
    // There must be a sequence_length parameter in body
    res.status(400).send({
      message:
        "Content can not be empty! Define the sequence_length parameter in body.",
    });
    return;
  }

  let new_notes = [];
  for (let idx in notes) {
    let note = notes[idx];

    // Validate note
    if (
      note.violin_string < 1 ||
      note.violin_string > 4 ||
      note.violin_finger < 0 ||
      note.violin_finger > 4 ||
      note.viola_finger < 0 ||
      note.viola_finger > 4 ||
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
      activity_id: id,
      order: idx,
      name: note.name,
      violin_string: note.violin_string,
      violin_finger: note.violin_finger,
      viola_string: note.viola_string,
      viola_finger: note.viola_finger,
      note_code: note.note_code,
      type: note.type,
    };
    new_notes.push(_note);
  }

  try {
    await sequelize.transaction(async (t) => {
      await Activity.update(
        {
          description: description,
        },
        {
          where: {
            id: id,
          },
          transaction: t,
        }
      );

      switch (activity.GameActivity.gamemode_id) {
        case 1:
          // Identify
          // Remove all submitted responses
          await IdentifyModeStatus.destroy({
            where: { activity_id: id },
            transaction: t,
          });
          break;
        case 2:
          // Play
          // Remove all submitted responses
          await PlayModeStatus.destroy({
            where: { activity_id: id },
            transaction: t,
          });
          break;
        case 3:
          // Build
          // Remove all submitted responses
          await BuildModeStatus.destroy({
            where: { activity_id: id },
            transaction: t,
          });
          // Update the sequence_length
          await BuildMode.update(
            {
              sequence_length: sequence_length,
            },
            {
              where: {
                activity_id: id,
              },
              transaction: t,
            }
          );
          break;
      }

      // Remove the activity completed state from all users
      await CompletedActivity.destroy({
        where: {
          activity_id: id,
        },
        transaction: t,
      });

      // Remove old notes
      await MusicalNote.destroy({
        where: {
          activity_id: id,
        },
        transaction: t,
      });

      // Set new musical notes
      for (let idx in new_notes) {
        await MusicalNote.create(new_notes[idx], { transaction: t });
      }
    });
    res.send({
      message: "Activity was updated successfully.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message:
        err.message || "Some error occurred while updating the Activity.",
    });
  }
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
        activity_id: activity_id,
      },
      include: [
        {
          model: BuildModeStatus,
          where: {
            activity_id: activity_id,
            user_id: req.userId,
          },
        },
      ],
    });
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

// Get Media from Game Activity
exports.getSubmittedMediaOfStudent = async (req, res) => {
  const class_id = req.params.class_id;
  const activity_id = req.params.activity_id;
  const student_id = req.params.student_id;

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
            user_id: student_id,
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
        activity_id: activity_id,
      },
      include: [
        {
          model: BuildModeStatus,
          where: {
            activity_id: activity_id,
            user_id: student_id,
          },
        },
      ],
    });
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

// Submit Game of type Build
exports.submitGameBuild = async (req, res) => {
  const class_id = req.params.class_id;
  const activity_id = req.params.activity_id;
  const user_id = req.userId;
  const chosen_notes = req.body.chosen_notes;

  if (!req.file || !chosen_notes) {
    res.status(400).send({
      message:
        "Content can not be empty! Define media and chosen_notes in form-data.",
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
  if (activity.GameActivity.gamemode_id !== 3) {
    res.status(400).send({
      message: "GameActivity is not of type Build!",
    });
    return;
  }

  let notes = [];
  for (let idx in chosen_notes) {
    let note_id = chosen_notes[idx];

    const musicalnote = await MusicalNote.findOne({
      where: {
        id: note_id,
        activity_id: activity_id,
      },
    });
    if (musicalnote === null) {
      res.status(400).send({
        message: "Invalid musical note with id=" + note_id,
      });
      return;
    }

    notes.push({ note_id: note_id, order: idx });
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

  const build_mode_status = {
    activity_id: activity_id,
    user_id: user_id,
    media_id: file_name,
    media_type: media_type,
    media_secret: secret_key,
  };

  const data = await BuildModeStatus.findOne({
    where: {
      activity_id: activity_id,
      user_id: user_id,
    },
  });
  if (data === null) {
    try {
      const result = await sequelize.transaction(async (t) => {
        const status = await BuildModeStatus.create(build_mode_status, {
          transaction: t,
        });

        for (let idx in notes) {
          let note = notes[idx];
          note.status_id = status.id;
          console.log(note);
          await UserChosenNotes.create(note, { transaction: t });
        }

        return status;
      });
      res.send({
        message: "Game submitted successfully",
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while creating the BuildModeStatus.",
      });
    }
  } else {
    // Update the video submitted
    try {
      const result = await sequelize.transaction(async (t) => {
        const status = await BuildModeStatus.update(
          {
            media_id: file_name,
            media_type: media_type,
            media_secret: secret_key,
          },
          { where: { id: data.id }, transaction: t }
        );

        for (let idx in notes) {
          let note = notes[idx];
          note.status_id = status.id;
          await UserChosenNotes.update(
            { note_id: note.note_id },
            { where: { status_id: data.id, order: note.order }, transaction: t }
          );
        }
      });

      res.send({
        message: "Game submitted successfully",
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while updating the BuildModeStatus.",
      });
    }
  }
};

// Put Feedback to student
exports.putFeedbackToStudent = async (req, res) => {
  const class_id = req.params.class_id;
  const activity_id = req.params.activity_id;
  const student_id = req.params.student_id;
  const feedback = req.body.feedback;
  const trophy = req.body.trophy_id;

  if (!feedback) {
    res.status(400).send({
      message: "Content can not be empty! Define a feedback in body.",
    });
    return;
  }

  // Check Activity
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
  if (activity.activitytype_id !== 4) {
    res.status(400).send({
      message: "Activity is not of type Game!",
    });
    return;
  }

  let GameTypeStatus;
  let game_mode;
  switch (activity.GameActivity.gamemode_id) {
    case 1:
      GameTypeStatus = IdentifyModeStatus;
      game_mode = "Identify";
      break;
    case 2:
      GameTypeStatus = PlayModeStatus;
      game_mode = "Play";
      break;
    case 3:
      GameTypeStatus = BuildModeStatus;
      game_mode = "Build";
      break;
  }

  // Get ActivityStatus
  let activity_game_status = await GameTypeStatus.findOne({
    where: {
      activity_id: activity_id,
      user_id: student_id,
    },
  });
  if (activity_game_status === null) {
    res.status(400).send({
      message: "Activity not submitted!",
    });
    return;
  }

  const status = {
    teacher_feedback: feedback,
  }
  let trophy_to_delete = null;
  if (trophy != null) {
    // Check Trophy
    let _trophy = await Trophy.findByPk(trophy);
    if (_trophy == null) {
      res.status(400).send({
        message: "Invalid trophy!",
      });
      return;
    }
    if (activity_game_status.trophy_id !== trophy) {
      _trophy = await UserTrophies.findOne({
        where: {
          userId: student_id,
          trophyId: trophy,
        },
      });
      if (_trophy != null) {
        res.status(400).send({
          message: "User already has the trophy.",
        });
        return;
      }
      status.trophy_id = trophy;
    }
  } else {
    status.trophy_id = null;
    trophy_to_delete = activity_game_status.trophy_id;
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      await GameTypeStatus.update(status,
        {
          where: {
            activity_id: activity_id,
            user_id: student_id,
          },
          transaction: t,
        }
      );

      if (status.trophy_id != null) {
        await UserTrophies.create(
          {
            UserId: student_id,
            TrophyId: trophy,
          },
          { transaction: t }
        );
      }

      if (trophy_to_delete != null) {
        await UserTrophies.destroy({
          where: {
            UserId: student_id,
            TrophyId: trophy_to_delete
          },
          transaction: t
        })
      }

      let student = await User.findByPk(student_id);
      const message = {
        title: "Feedback do professor!",
        message: `Jogo ${activity.order}. ${activity.title} no grupo de atividades ${activity.activitygroup.name}!`,
        activity_type: "Game",
        activity_id: activity_id,
        activity_order: activity.order,
        activity_title: activity.title,
        activity_description: activity.description,
        activitygroup_name: activity.activitygroup.name,
        activity_game_mode: game_mode,
      };

      req.sns.publish(
        {
          TopicArn: student.notification_topic_arn,
          Message: JSON.stringify({ default: JSON.stringify(message) }),
          MessageStructure: "json",
        },
        function (err, data) {
          if (err) {
            console.error("Error publishing SNS message:", err);
            res.status(200).send({
              message: "There was an error updating the activity.",
            });
          } else {
            console.log("SNS message published:", data);

            if (status.trophy_id != null) {
              // TODO: Send Notification
              res.status(200).send({
                message: "Activity updated successfully!",
              });
            } else {
              res.status(200).send({
                message: "Activity updated successfully!",
              });
            }
          }
        }
      );
    });
  } catch (err) {
    res.status(500).send({
      message:
        err.message ||
        "Could not set feedback in the activity with id=" + activity_id,
    });
  }
};
