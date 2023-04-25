const { sequelize } = require("../models");
const db = require("../models");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const Activity = db.activities;
const ActivityGroup = db.activitygroups;
const ExerciseActivity = db.exerciseactivities;
const ExerciseActivityStatus = db.exerciseactivitystatus;
const Answer = db.answers;
const QuestionActivity = db.questionactivities;
const QuestionActivityStatus = db.questionactivitystatus;
const User = db.users;

// Create and Save a new Activity of type Question
exports.createQuestion = async (req, res) => {
  // Validate request
  if (
    !req.body.activitygroup_id ||
    !req.body.question ||
    !req.body.answers ||
    !req.body.one_answer_only
  ) {
    res.status(400).send({
      message:
        "Content can not be empty! Define a activitygroup_id, question, answers and one_answer_only in form-data.",
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
  console.log(req.files);
  if (req.files.question_media) {
    // Save media type
    media_type = req.files.question_media[0].mimetype;
    secret_key = crypto.randomBytes(16).toString("hex");
    // Encrypt file
    const encryptedFile = CryptoJS.AES.encrypt(
      req.files.question_media[0].buffer.toString("base64"),
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

  // Create an Activity
  const activity = {
    order: order,
    activitygroup_id: req.body.activitygroup_id,
    title: "Pergunta",
    description: null,
    activitytype_id: 3, // Question
    QuestionActivity: {
      question: req.body.question,
      one_answer_only: req.body.one_answer_only,
      media_id: file_name,
      media_type: media_type,
      media_secret: secret_key,
    },
  };

  let answer_media_counter = 0;
  let answers = [];
  for (let idx in req.body.answers) {
    console.log(req.body.answers[idx])
    let answer = JSON.parse(req.body.answers[idx]);
    if (answer.hasMedia) {
      // Save media type
      media_type = req.files.answers_media[answer_media_counter].mimetype;
      if (media_type.split("/")[0] !== "image") {
        res.status(400).send("Invalid answer media file. It must be an image.");
        return;
      }
      secret_key = crypto.randomBytes(16).toString("hex");
      // Encrypt file
      const encryptedFile = CryptoJS.AES.encrypt(
        req.files.answers_media[answer_media_counter].buffer.toString("base64"),
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
      answer_media_counter++;
    } else {
      media_type = null;
      secret_key = null;
      file_name = null;
    }

    // Create answer
    const _answer = {
      order: idx,
      answer: answer.answer,
      media_id: file_name,
      media_type: media_type,
      media_secret: secret_key,
    };
    answers.push(_answer);
  }

  activity.QuestionActivity.Answers = answers;

  console.log(activity);

  // Save Activity in the database
  Activity.create(activity, {
    include: {
      model: QuestionActivity,
      include: [Answer],
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


// Put Feedback to student
exports.putFeedbackToStudent = async (req, res) => {
  const class_id = req.params.class_id;
  const activity_id = req.params.activity_id;
  const student_id = req.params.student_id;
  const feedback = req.body.feedback;

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

  // Get QuestionActivityStatus
  let activity_question = await QuestionActivity.findOne({
    where: {
      activity_id: activity_id,
    },
    include: [
      {
        model: QuestionActivityStatus,
        where: {
          activity_id: activity_id,
          user_id: student_id,
        },
      },
    ],
  });
  if (activity_question === null) {
    res.status(400).send({
      message: "Activity not submitted!",
    });
    return;
  }
  
  QuestionActivityStatus.update({
    teacher_feedback: feedback
  }, {
    where: {
      activity_id: activity_id,
      user_id: student_id
    }
  }).then((data) => {

    User.findByPk(student_id).then((student) => {

      const message = {
        title: "Feedback do professor!",
        message: `Recebeu feedback do professor na sua pergunta ${activity.order}. ${activity.title} no grupo de atividades ${activity.activitygroup.name}!`,
        activity_type: "Question",
        activity_id: activity_id,
        activity_order: activity.order,
        activity_title: activity.title,
        activity_description: activity.description,
        activitygroup_name: activity.activitygroup.name
      }
      
      req.sns.publish({
        TopicArn: student.notification_topic_arn,
        Message: JSON.stringify({ default: JSON.stringify(message)}),
        MessageStructure: 'json'
      }, function(err, data) {
        if (err) {
          console.error('Error publishing SNS message:', err);
          res.status(200).send({
            message: "There was an error updating the activity.",
          });
        } else {
          console.log('SNS message published:', data);
          res.status(200).send({
            message: "Activity updated successfully!",
          });
        }
      })
    })

  }).catch((err) => {
    console.log(error);
    res.status(500).send({
      message: "Failed to update activity.",
    });
  })
};
