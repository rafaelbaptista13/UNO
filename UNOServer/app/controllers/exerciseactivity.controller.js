const { sequelize } = require("../models");
const db = require("../models");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const Activity = db.activities;
const ActivityGroup = db.activitygroups;
const ExerciseActivity = db.exerciseactivities;
const ExerciseActivityStatus = db.exerciseactivitystatus;
const User = db.users;
const Trophy = db.trophies;
const UserTrophies = db.usertrophies;
const cache = require("../middleware/cache");
const Notification = db.notifications;

// Create and Save a new Activity of type Exercise
exports.createExercise = async (req, res) => {
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
    console.log("tenho file");
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
  const title = req.body.title;
  const description = req.body.description;
  const empty_media = req.body.empty_media;

  // Validate request
  if (!empty_media || typeof description !== "string" || !title) {
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
  if (activity.activitytype_id !== 2) {
    res.status(400).send({
      message: "Activity is not of type Exercise!",
    });
    return;
  }

  let updated_exercise_activity = { ExerciseActivity: {} };
  if (title) {
    updated_exercise_activity.title = title;
  }
  if (description) {
    updated_exercise_activity.description = description;
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
    updated_exercise_activity.ExerciseActivity.media_id = file_name;
    updated_exercise_activity.ExerciseActivity.media_type = media_type;
    updated_exercise_activity.ExerciseActivity.media_secret = secret_key;
  }
  if (empty_media === "true") {
    updated_exercise_activity.ExerciseActivity.media_id = null;
    updated_exercise_activity.ExerciseActivity.media_type = null;
    updated_exercise_activity.ExerciseActivity.media_secret = null;
  }

  try {
    await sequelize.transaction(async (t) => {
      await Activity.update(updated_exercise_activity, {
        where: {
          id: id,
        },
        transaction: t,
      });

      if (Object.keys(updated_exercise_activity.ExerciseActivity).length > 0) {
        await ExerciseActivity.update(
          updated_exercise_activity.ExerciseActivity,
          {
            where: {
              activity_id: id,
            },
            transaction: t,
          }
        );
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

  if (activity.ExerciseActivity.media_type === null) {
    res.status(400).send({
      message: "This activity does not contain any media associated!",
    });
    return;
  }

  // Save media type
  const media_type = activity.ExerciseActivity.media_type;

  const cached_data = cache.get(activity.ExerciseActivity.media_id);
  if (cached_data) {
    res.set("Content-Type", cached_data.media_type);
    res.status(200).send(Buffer.from(cached_data.data, "base64"));
    return;
  }

  // Get Media from aws s3
  const s3Object = await req.s3
    .getObject({ Bucket: "violuno", Key: activity.ExerciseActivity.media_id })
    .promise();

  // Decrypt
  const decryptedFile = CryptoJS.AES.decrypt(
    s3Object.Body.toString(),
    activity.ExerciseActivity.media_secret
  );

  const new_cached_data = {
    media_type,
    data: decryptedFile.toString(CryptoJS.enc.Utf8)
  }
  cache.set(activity.ExerciseActivity.media_id, new_cached_data);

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

// Get Media from Exercise Activity
exports.getSubmittedMediaOfStudent = async (req, res) => {
  const class_id = req.params.class_id;
  const activity_id = req.params.activity_id;
  const student_id = req.params.student_id;

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
          user_id: student_id,
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

// Put Feedback to student
exports.putFeedbackToStudent = async (req, res) => {
  const class_id = req.params.class_id;
  const activity_id = req.params.activity_id;
  const student_id = req.params.student_id;
  const feedback = req.body.feedback;
  const trophy = req.body.trophy;

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
          user_id: student_id,
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

    console.log(activity_exercise.ExerciseActivityStatus.trophy_id);
    console.log(trophy);
    if (activity_exercise.ExerciseActivityStatus.trophy_id !== trophy) {
      // The user is changing the trophy given
      trophy_to_delete = activity_exercise.ExerciseActivityStatus.trophy_id;
      status.trophy_id = trophy;
    }
  } else {
    status.trophy_id = null;
    trophy_to_delete = activity_exercise.ExerciseActivityStatus.trophy_id;
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      await ExerciseActivityStatus.update(status,
        {
          where: {
            activity_id: activity_id,
            user_id: student_id,
          },
          transaction: t
        }
      );

      if (status.trophy_id != null) {
        await createTrophy(student_id, status.trophy_id, t);
      }

      if (trophy_to_delete != null) {
        await deleteTrophy(student_id, trophy_to_delete, t);
      }

      let student = await User.findByPk(student_id);
      const message = {
        type: "feedback_activity",
        title: "Feedback do professor!",
        message: `Exercício ${activity.order}. ${activity.title} no grupo de atividades ${activity.activitygroup.name}!`,
        activity_type: "Exercise",
        activity_id: activity_id,
        activity_order: activity.order,
        activity_title: activity.title,
        activity_description: activity.description,
        activitygroup_name: activity.activitygroup.name,
      };
      await Notification.create({
        ...message,
        user_id: student_id
      });

      req.sns.publish(
        {
          TopicArn: student.notification_topic_arn,
          Message: JSON.stringify({ default: JSON.stringify(message) }),
          MessageStructure: "json",
        },
        async function (err, data) {
          if (err) {
            console.error("Error publishing SNS message:", err);
            res.status(200).send({
              message: "There was an error updating the activity.",
            });
          } else {
            console.log("SNS message published:", data);

            if (status.trophy_id != null) {

              const trophy_message = {
                type: "new_trophy",
                title: "Troféu novo!",
                message: `Ganhaste um troféu novo!`,
              };
              await Notification.create({
                ...trophy_message,
                user_id: student_id
              });

              req.sns.publish(
                {
                  TopicArn: student.notification_topic_arn,
                  Message: JSON.stringify({ default: JSON.stringify(trophy_message) }),
                  MessageStructure: "json",
                },
                function (err, data) {
                  if (err) {
                    console.error("Error publishing SNS message:", err);
                    res.status(200).send({
                      message: "There was an error notifying about the trophy.",
                    });
                  } else {
                    res.status(200).send({
                      message: "Activity updated successfully!",
                    });
                  }
                }
              );
              
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


const deleteTrophy = async (student_id, trophy_to_delete, t) => {
  // Get count of user trophies
  let user_trophy = await UserTrophies.findOne({
    where: {
      UserId: student_id,
      TrophyId: trophy_to_delete
    },
    transaction: t
  })
  if (user_trophy.count === 1) {
    await UserTrophies.destroy({
      where: {
        UserId: student_id,
        TrophyId: trophy_to_delete
      },
      transaction: t
    })
  } else {
    await UserTrophies.update({
      count: user_trophy.count - 1
    }, {
      where: {
        UserId: student_id,
        TrophyId: trophy_to_delete
      },
      transaction: t
    })
  }
}

const createTrophy = async (student_id, new_trophy, t) => {
  let user_trophy = await UserTrophies.findOne({
    where: {
      UserId: student_id,
      TrophyId: new_trophy
    },
    transaction: t
  })
  if (user_trophy === null) {
    await UserTrophies.create({
      UserId: student_id,
      TrophyId: new_trophy,
      count: 1
    }, {transaction: t})
  } else {
    await UserTrophies.update({
      count: user_trophy.count + 1
    }, {
      where: {
        UserId: student_id,
        TrophyId: new_trophy
      },
      transaction: t
    })
  }
}