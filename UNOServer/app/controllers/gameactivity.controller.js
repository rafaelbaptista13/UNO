const { sequelize } = require("../models");
const db = require("../models");
const Activity = db.activities;
const ActivityGroup = db.activitygroups;
const PlayMode = db.playmode;
const GameActivity = db.gameactivities;
const MusicalNote = db.musicalnotes;

// Create and Save a new Activity of type Game
exports.createGame = async (req, res) => {
  const gamemode = req.body.mode;
  // Validate request
  if (
    !req.body.activitygroup_id ||
    !req.body.mode ||
    !req.body.notes
  ) {
    res.status(400).send({
      message:
        "Content can not be empty! Define a activitygroup_id, mode and notes body.",
    });
    return;
  }
  if (gamemode !== "Identify" && gamemode !== "Play" && gamemode !== "Build") {
    res.status(400).send({
      message:
        "Invalid game mode. It must be Identify, Play or Build.",
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
    const _note = {
      order: idx,
      name: note.name,
      violin_string: note.violin_string,
      violin_finger: note.violin_finger,
      viola_string: note.viola_string,
      viola_finger: note.viola_finger
    }
    notes.push(_note);
  }

  let GameModeModel;
  let activity;
  // Create an Activity
  if (gamemode === "Identify") {
    // TODO
  } else if (gamemode === "Play") {
    activity = {
      order: order,
      activitygroup_id: req.body.activitygroup_id,
      title: "A Cor do Som",
      description: null,
      activitytype_id: 4, // Game
      GameActivity: {
        gamemode_id: 2, // PlayMode
        PlayMode: {
          MusicalNotes: notes
        }
      },
    };
    GameModeModel = PlayMode;
  } else if (gamemode === "Build") {
    // TODO
  }

  // Save Activity in the database
  Activity.create(activity, {
    include: {
      model: GameActivity,
      include: [
        {
          model: GameModeModel,
          include: [MusicalNote]
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

// Submit question
exports.submitQuestion = async (req, res) => {
  const class_id = req.params.class_id;
  const activity_id = req.params.activity_id;
  const user_id = req.userId;
  const chosen_answers = req.body.chosen_answers;

  if (!chosen_answers) {
    res.status(400).send({
      message: "Content can not be empty! Define a chosen_answers in body.",
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
        model: QuestionActivity,
        include: [Answer],
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
  if (activity.activitytype_id !== 3) {
    res.status(400).send({
      message: "Activity is not of type Question!",
    });
    return;
  }

  if (activity.QuestionActivity.one_answer_only) {
    if (chosen_answers.length > 1) {
      res.status(400).send({
        message: "Can only choose one answer.",
      });
      return;
    }
  }
  const answers = await Answer.findAll({
    where: { order: chosen_answers, activity_id: activity_id },
  });

  if (answers.length == 0) {
    res.status(400).send({
      message: "Invalid answer.",
    });
    return;
  }
  console.log(answers);
  const question_activity_status = {
    activity_id: activity_id,
    user_id: user_id,
  };

  const data = await QuestionActivityStatus.findOne({
    where: {
      activity_id: activity_id,
      user_id: user_id,
    },
  });
  if (data === null) {

    try {
      const result = await sequelize.transaction(async (t) => {

        const status = await QuestionActivityStatus.create(question_activity_status, {transaction: t});
        await status.addAnswers(answers, {transaction: t});

        return status;
      })
      res.send({
        message: "Question submitted successfully",
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while creating the QuestionActivityStatus.",
      });
    }
  } else {
    // Update the answers submitted
    const answersToRemove = await data.getAnswers();
    await data.removeAnswers(answersToRemove);
    data.addAnswers(answers)
      .then(async () => {
        res.send({
          message: "Question submitted successfully",
        });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while updating the QuestionActivityStatus.",
        });
      });
  }
};

// Update an Activity of type Question
exports.updateQuestion = async (req, res) => {
  const id = req.params.id;
  const class_id = req.params.class_id;

  // Validate request
  if (!req.body.title || !req.body.description) {
    res.status(400).send({
      message:
        "Content can not be empty! Define a title, description in form-data.",
    });
    return;
  }

  // Check if user has access to activity
  const activity = Activity.findOne({
    where: {
      id: id,
    },
    include: [
      {
        model: ActivityGroup,
        as: "activitygroup",
        where: { class_id: class_id },
      },
    ],
  });
  if (activity === null) {
    res.status(400).send({
      message: "You're not the teacher of this Activity.",
    });
    return;
  }

  // Check activity type
  if (activity.activitytype_id !== 2) {
    res.status(400).send({
      message: "Activity is not of type Exercise!",
    });
    return;
  }

  let media_type;
  let secret_key;
  let file_name;
  if (req.file) {
    media_type = req.file.mimetype;
    secret_key = crypto.randomBytes(16).toString("hex");
    // Encrypt file
    const encryptedFile = CryptoJS.AES.encrypt(
      req.file.buffer.toString("base64"),
      secret_key
    );

    // Generate file name
    file_name = uuidv4();
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

    const new_activity = {
      title: req.body.title,
      description: req.body.description,
      ExerciseActivity: {
        media_id: file_name,
        media_type: media_type,
        media_secret: secret_key,
      },
    };

    try {
      await sequelize.transaction(async (t) => {
        await Activity.update(new_activity, {
          where: {
            id: id,
          },
          transaction: t,
        });

        await ExerciseActivity.update(new_activity.ExerciseActivity, {
          where: {
            activity_id: id,
          },
          transaction: t,
        });
      });
      res.send({
        message: "Activity was updated successfully.",
      });
    } catch (err) {
      res.status(500).send({
        message:
          err.message || "Some error occurred while updating the Activity.",
      });
    }
  } else {
    // No need to update the media file
    const new_activity = {
      title: req.body.title,
      description: req.body.description,
    };

    Activity.update(new_activity, {
      where: {
        id: id,
      },
      transaction: t,
    })
      .then(() => {
        res.send({
          message: "Activity was updated successfully.",
        });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while updating the Activity.",
        });
      });
  }
};

// Get Media from Question Activity
exports.getMedia = async (req, res) => {
  const class_id = req.params.class_id;
  const activity_id = req.params.activity_id;

  // Get Activity
  let activity = await Activity.findOne({
    where: {
      id: activity_id,
    },
    include: [
      {
        model: QuestionActivity,
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
  if (activity.activitytype_id !== 3) {
    res.status(400).send({
      message: "Activity is not of type Question!",
    });
    return;
  }

  if (activity.QuestionActivity.media_type === null) {
    res.status(400).send({
      message: "This activity does not contain any media associated!",
    });
    return;
  }

  // Save media type
  const media_type = activity.QuestionActivity.media_type;

  // Get Media from aws s3
  const s3Object = await req.s3
    .getObject({ Bucket: "violuno", Key: activity.QuestionActivity.media_id })
    .promise();

  // Decrypt
  const decryptedFile = CryptoJS.AES.decrypt(
    s3Object.Body.toString(),
    activity.QuestionActivity.media_secret
  );

  res.set("Content-Type", media_type);
  res
    .status(200)
    .send(Buffer.from(decryptedFile.toString(CryptoJS.enc.Utf8), "base64"));
};

// Get Media from Question Activity
exports.getMediaFromAnswer = async (req, res) => {
  const class_id = req.params.class_id;
  const activity_id = req.params.activity_id;
  const order = req.params.order;

  // Get Activity
  let activity = await Activity.findOne({
    where: {
      id: activity_id,
    },
    include: [
      {
        model: QuestionActivity,
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
  if (activity.activitytype_id !== 3) {
    res.status(400).send({
      message: "Activity is not of type Question!",
    });
    return;
  }

  let answer = await Answer.findOne({
    where: {
      activity_id: activity_id,
      order: order
    }
  })
  if (answer == null) {
    res.status(400).send({
      message: "Answer not found!",
    });
    return;
  }
  if (answer.media_type == null) {
    res.status(400).send({
      message: "Answer does not have any media!",
    });
    return;
  }

  // Save media type
  const media_type = answer.media_type;

  // Get Media from aws s3
  const s3Object = await req.s3
    .getObject({ Bucket: "violuno", Key: answer.media_id })
    .promise();

  // Decrypt
  const decryptedFile = CryptoJS.AES.decrypt(
    s3Object.Body.toString(),
    answer.media_secret
  );

  res.set("Content-Type", media_type);
  res
    .status(200)
    .send(Buffer.from(decryptedFile.toString(CryptoJS.enc.Utf8), "base64"));
};

