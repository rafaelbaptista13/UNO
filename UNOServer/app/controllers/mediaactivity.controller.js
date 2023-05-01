const { sequelize } = require("../models");
const db = require("../models");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const Activity = db.activities;
const ActivityGroup = db.activitygroups;
const MediaActivity = db.mediaactivities;
const MediaActivityStatus = db.mediaactivitystatus;

// Create and Save a new Activity of type Media
exports.createMedia = async (req, res) => {
  // Validate request
  if (!req.body.activitygroup_id || !req.body.title) {
    res.status(400).send({
      message:
        "Content can not be empty! Define a activitygroup_id, title in form-data.",
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

  let media_type;
  let secret_key;
  let file_name;
  if (req.file) {
    // Save media type
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
  } else {
    media_type = null;
    secret_key = null;
    file_name = null;
  }

  // Create a Activity
  const activity = {
    order: order,
    activitygroup_id: req.body.activitygroup_id,
    title: req.body.title,
    description: req.body.description,
    activitytype_id: 1, // Media
    MediaActivity: {
      media_id: file_name,
      media_type: media_type,
      media_secret: secret_key,
    },
  };

  // Save Activity in the database
  Activity.create(activity, { include: [MediaActivity] })
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

// Set activity to completed
exports.submit = async (req, res) => {
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
        model: MediaActivity,
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
  if (activity.activitytype_id !== 1) {
    res.status(400).send({
      message: "Activity is not of type Media!",
    });
    return;
  }

  const media_activity_status = {
    activity_id: activity_id,
    user_id: user_id,
  };

  MediaActivityStatus.create(media_activity_status)
    .then(() => {
      res.send({
        message: "Media activity submitted successfully",
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while creating the MediaActivityStatus.",
      });
    });
};

// Update an Activity of type Media
exports.updateMedia = async (req, res) => {
  const id = req.params.id;
  const class_id = req.params.class_id;
  const title = req.body.title;
  const description = req.body.description;
  const empty_media = req.body.empty_media;

  // Validate request
  if (!empty_media || !description || !title) {
    res.status(400).send({
      message:
        "Content can not be empty! Define the title, description and empty_media parameters in form-data.",
    });
    return;
  }

  // Check if user has access to activity
  const activity = await Activity.findOne({
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
  if (activity.activitytype_id !== 1) {
    res.status(400).send({
      message: "Activity is not of type Media!",
    });
    return;
  }

  let updated_media_activity = { MediaActivity: {} };
  if (title) {
    updated_media_activity.title = title;
  }
  if (description) {
    updated_media_activity.description = description;
  }

  if (empty_media === "false" && req.file) {
    // Save media type
    let media_type = req.file.mimetype;
    let secret_key = crypto.randomBytes(16).toString("hex");
    // Encrypt file
    const encryptedFile = CryptoJS.AES.encrypt(
      req.file.buffer.toString("base64"),
      secret_key
    );

    // Generate file name
    let file_name = uuidv4();
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
    updated_media_activity.MediaActivity.media_id = file_name;
    updated_media_activity.MediaActivity.media_type = media_type;
    updated_media_activity.MediaActivity.media_secret = secret_key;
  }
  if (empty_media === "true") {
    updated_media_activity.MediaActivity.media_id = null;
    updated_media_activity.MediaActivity.media_type = null;
    updated_media_activity.MediaActivity.media_secret = null;
  }

  try {
    await sequelize.transaction(async (t) => {
      await Activity.update(updated_media_activity, {
        where: {
          id: id,
        },
        transaction: t,
      });

      if (Object.keys(updated_media_activity.MediaActivity).length > 0) {
        await MediaActivity.update(updated_media_activity.MediaActivity, {
          where: {
            activity_id: id,
          },
          transaction: t,
        });
      }
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

// Get Media from Media Activity
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
        model: MediaActivity,
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
  if (activity.activitytype_id !== 1) {
    res.status(400).send({
      message: "Activity is not of type Media!",
    });
    return;
  }

  if (activity.MediaActivity.media_type === null) {
    res.status(400).send({
      message: "This activity does not contain any media associated!",
    });
    return;
  }

  // Save media type
  const media_type = activity.MediaActivity.media_type;

  // Get Media from aws s3
  const s3Object = await req.s3
    .getObject({ Bucket: "violuno", Key: activity.MediaActivity.media_id })
    .promise();

  // Decrypt
  const decryptedFile = CryptoJS.AES.decrypt(
    s3Object.Body.toString(),
    activity.MediaActivity.media_secret
  );

  res.set("Content-Type", media_type);
  res
    .status(200)
    .send(Buffer.from(decryptedFile.toString(CryptoJS.enc.Utf8), "base64"));
};
