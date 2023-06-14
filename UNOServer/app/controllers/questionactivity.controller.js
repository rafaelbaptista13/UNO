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
const UserAnswered = db.useranswered;
const CompletedActivity = db.completedactivities;
const User = db.users;
const Trophy = db.trophies;
const UserTrophies = db.usertrophies;
const cache = require("../middleware/cache");

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
    console.log(req.body.answers[idx]);
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
        const status = await QuestionActivityStatus.create(
          question_activity_status,
          { transaction: t }
        );

        for (let idx in answers) {
          let answer = { status_id: status.id, order: answers[idx].order };
          await UserAnswered.create(answer, { transaction: t });
        }

        return status;
      });
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
    try {
      await sequelize.transaction(async (t) => {
        await UserAnswered.destroy({
          where: {
            status_id: data.id,
          },
          transaction: t,
        });

        // Set new answers
        for (let idx in answers) {
          let answer = { status_id: data.id, order: answers[idx].order };
          await UserAnswered.create(answer, { transaction: t });
        }
      });
      res.send({
        message: "Question submitted successfully",
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while updating the QuestionActivityStatus.",
      });
    }
  }
};

// Update an Activity of type Question
exports.updateQuestion = async (req, res) => {
  const id = req.params.id;
  const class_id = req.params.class_id;
  const question = req.body.question;
  const answers = req.body.answers;
  const one_answer_only = req.body.one_answer_only;
  const empty_media = req.body.empty_media;

  // Validate request
  if (
    typeof question !== "string" ||
    !answers ||
    !one_answer_only ||
    !empty_media
  ) {
    res.status(400).send({
      message:
        "Content can not be empty! Define a question, answers, one_answer_only and empty_media parameters in form-data.",
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
  if (activity.activitytype_id !== 3) {
    res.status(400).send({
      message: "Activity is not of type Question!",
    });
    return;
  }

  let updated_question_activity = {
    question: question,
    one_answer_only: one_answer_only,
  };
  if (empty_media === "true") {
    updated_question_activity.media_id = null;
    updated_question_activity.media_type = null;
    updated_question_activity.media_secret = null;
  } else {
    if (empty_media === "false" && req.files.question_media) {
      // Save media type
      let media_type = req.files.question_media[0].mimetype;
      let secret_key = crypto.randomBytes(16).toString("hex");
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
      updated_question_activity.media_id = file_name;
      updated_question_activity.media_type = media_type;
      updated_question_activity.media_secret = secret_key;
    }
  }

  let answer_media_counter = 0;
  let new_answers = [];
  for (let idx in answers) {
    let answer = JSON.parse(answers[idx]);
    if (answer.hasMedia) {
      // Save media type
      media_type = req.files.answers_media[answer_media_counter].mimetype;
      if (media_type.split("/")[0] !== "image") {
        res.status(400).send("Invalid answer media file. It must be an image.");
        return;
      }
      secret_key = crypto.randomBytes(16).toString("hex");
      console.log(req.files.answers_media);
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
      activity_id: id,
      order: idx,
      answer: answer.answer,
      media_id: file_name,
      media_type: media_type,
      media_secret: secret_key,
    };
    new_answers.push(_answer);
  }

  try {
    await sequelize.transaction(async (t) => {
      let all_users_states = await QuestionActivityStatus.findAll({
        where: { activity_id: id },
      });
      for (let idx in all_users_states) {
        let question_state = all_users_states[idx];
        console.log(question_state.id);
        // Remove answers given by user
        await UserAnswered.destroy({
          where: {
            status_id: question_state.id,
          },
          transaction: t,
        });
      }

      // Remove Question Activity Status from all users
      await QuestionActivityStatus.destroy({
        where: {
          activity_id: id,
        },
        transaction: t,
      });

      // Remove the activity completed state from all users
      await CompletedActivity.destroy({
        where: {
          activity_id: id,
        },
        transaction: t,
      });

      // Remove all previous answers
      await Answer.destroy({
        where: {
          activity_id: id,
        },
        transaction: t,
      });

      // Update Activity
      await QuestionActivity.update(updated_question_activity, {
        where: {
          activity_id: id,
        },
        transaction: t,
      });
      // Set new answers
      for (let idx in new_answers) {
        let answer = new_answers[idx];
        await Answer.create(answer, { transaction: t });
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

  const cached_data = cache.get(activity.QuestionActivity.media_id);
  if (cached_data) {
    res.set("Content-Type", cached_data.media_type);
    res.status(200).send(Buffer.from(cached_data.data, "base64"));
    return;
  }

  // Get Media from aws s3
  const s3Object = await req.s3
    .getObject({ Bucket: "violuno", Key: activity.QuestionActivity.media_id })
    .promise();

  // Decrypt
  const decryptedFile = CryptoJS.AES.decrypt(
    s3Object.Body.toString(),
    activity.QuestionActivity.media_secret
  );

  const new_cached_data = {
    media_type,
    data: decryptedFile.toString(CryptoJS.enc.Utf8)
  }
  cache.set(activity.QuestionActivity.media_id, new_cached_data);

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
      order: order,
    },
  });
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
    if (activity_question.QuestionActivityStatus.trophy_id !== trophy) {
      // The user is changing the trophy given
      trophy_to_delete = activity_question.QuestionActivityStatus.trophy_id;
      status.trophy_id = trophy;
    }
  } else {
    status.trophy_id = null;
    trophy_to_delete = activity_question.QuestionActivityStatus.trophy_id;
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      await QuestionActivityStatus.update(status,
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
        message: `${activity.order}. ${activity.title} no grupo de atividades ${activity.activitygroup.name}!`,
        activity_type: "Question",
        activity_id: activity_id,
        activity_order: activity.order,
        activity_title: activity.title,
        activity_description: activity.description,
        activitygroup_name: activity.activitygroup.name,
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

              const trophy_message = {
                type: "new_trophy",
                title: "Troféu novo!",
                message: `Ganhaste um troféu novo!`,
              };

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