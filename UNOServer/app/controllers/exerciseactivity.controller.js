const { sequelize } = require("../models");
const db = require("../models");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const Activity = db.activities;
const ActivityGroup = db.activitygroups;
const ExerciseActivity = db.exerciseactivities;
const ExerciseActivityStatus = db.exerciseactivitystatus;

// Create and Save a new Activity of type Exercise
exports.createExercise = async (req, res) => {
  // Validate request
  if (!req.body.activitygroup_id || !req.body.title || !req.file) {
    res.status(400).send({
      message:
        "Content can not be empty! Define a activitygroup_id, title and media in form-data.",
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

  // Create a Activity
  const activity = {
    order: order,
    activitygroup_id: req.body.activitygroup_id,
    title: req.body.title,
    description: req.body.description,
    activitytype_id: 2, // Exercise
    ExerciseActivity: {
      media_id: file_name,
      media_type: media_type,
      media_secret: secret_key,
    },
  };

  // Save Activity in the database
  Activity.create(activity, { include: [ExerciseActivity] })
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

// Submit video for exercise
exports.submitExercise = async (req, res) => {
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
        model: ExerciseActivity,
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
  if (activity.activitytype_id !== 2) {
    res.status(400).send({
      message: "Activity is not of type Exercise!",
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

  const data = await ExerciseActivityStatus.findOne({
    where: {
      activity_id: activity_id,
      user_id: user_id,
    },
  });
  if (data === null) {
    // Create new instance
    // Create ExerciseActivityStatus
    const exercise_activity_status = {
      activity_id: activity_id,
      user_id: user_id,
      media_id: file_name,
      media_type: media_type,
      media_secret: secret_key,
    };

    ExerciseActivityStatus.create(exercise_activity_status)
      .then(() => {
        res.send({
          message: "Exercise submitted successfully",
        });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while creating the ExerciseActivityStatus.",
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
          message: "Exercise submitted successfully",
        });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while updating the ExerciseActivityStatus.",
        });
      });
  }
};

// Update an Activity of type Exercise
exports.updateExercise = async (req, res) => {
  const id = req.params.id;
  const class_id = req.params.class_id;

  // Validate request
  if (!req.body.title || !req.body.description || !req.file) {
    res.status(400).send({
      message:
        "Content can not be empty! Define a title, description and media in form-data.",
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
};

// Get Media from Exercise Activity
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
        model: ExerciseActivity,
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
  if (activity.activitytype_id !== 2) {
    res.status(400).send({
      message: "Activity is not of type Exercise!",
    });
    return;
  }

  // Save media type
  const media_type = activity.ExerciseActivity.media_type;

  // Get Media from aws s3
  const s3Object = await req.s3
    .getObject({ Bucket: "violuno", Key: activity.ExerciseActivity.media_id })
    .promise();

  // Decrypt
  const decryptedFile = CryptoJS.AES.decrypt(
    s3Object.Body.toString(),
    activity.ExerciseActivity.media_secret
  );

  res.set("Content-Type", media_type);
  res
    .status(200)
    .send(Buffer.from(decryptedFile.toString(CryptoJS.enc.Utf8), "base64"));
};

// Get Media from Exercise Activity
exports.getSubmittedMedia = async (req, res) => {
  const class_id = req.params.class_id;
  const activity_id = req.params.activity_id;

  // Check Activity
  let activity = await Activity.findOne({
    where: {
      id: activity_id,
    },
    include: {
      model: ActivityGroup,
      as: "activitygroup",
      where: {
        class_id: class_id,
      },
    },
  });
  if (activity === null) {
    res.status(400).send({
      message: "Activity not found!",
    });
    return;
  }

  // Get ExerciseActivityStatus
  let activity_exercise = await ExerciseActivity.findOne({
    where: {
      activity_id: activity_id,
    },
    include: [
      {
        model: ExerciseActivityStatus,
        where: {
          activity_id: activity_id,
          user_id: req.userId,
        },
      },
    ],
  });
  if (activity_exercise === null) {
    res.status(400).send({
      message: "Activity not submitted!",
    });
    return;
  }

  // Save media type
  const media_type = activity_exercise.ExerciseActivityStatus.media_type;

  // Get Media from aws s3
  const s3Object = await req.s3
    .getObject({
      Bucket: "violuno",
      Key: activity_exercise.ExerciseActivityStatus.media_id,
    })
    .promise();

  // Decrypt
  const decryptedFile = CryptoJS.AES.decrypt(
    s3Object.Body.toString(),
    activity_exercise.ExerciseActivityStatus.media_secret
  );

  res.set("Content-Type", media_type);
  res
    .status(200)
    .send(Buffer.from(decryptedFile.toString(CryptoJS.enc.Utf8), "base64"));
};
