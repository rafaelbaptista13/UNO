const { sequelize } = require("../models");
const db = require("../models");
const Activity = db.activities;
const ActivityGroup = db.activitygroups;
const MediaActivity = db.mediaactivities;
const MediaActivityStatus = db.mediaactivitystatus;
const ActivityType = db.activitytypes;
const ExerciseActivityStatus = db.exerciseactivitystatus;
const ExerciseActivity = db.exerciseactivities;
const QuestionActivity = db.questionactivities;
const QuestionActivityStatus = db.questionactivitystatus;
const UserAnswered = db.useranswered;
const Answer = db.answers;
const GameActivity = db.gameactivities;
const PlayMode = db.playmode;
const MusicalNote = db.musicalnotes;
const GameMode = db.gamemodes;
const PlayModeStatus = db.playmodestatus;
const IdentifyMode = db.identifymode;
const IdentifyModeStatus = db.identifymodestatus;
const BuildMode = db.buildmode;
const BuildModeStatus = db.buildmodestatus;
const UserChosenNotes = db.userchosennotes;
const User = db.users;
const Class = db.classes;
const CompletedActivity = db.completedactivities;
const Role = db.roles;
const Trophy = db.trophies;
const Op = db.Sequelize.Op;

// Create and Save a new Activity
exports.create = async (req, res) => {
  // Validate request
  if (
    !req.body.activitygroup_id ||
    !req.body.type ||
    (!req.body.title && !["game", "question"].includes(req.body.type))
  ) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Check activity type
  if (
    !["video", "exercise", "game", "audio", "question"].includes(req.body.type)
  ) {
    res.status(400).send({
      message:
        "Invalid activity type. Must be a video, exercise, game, audio or question.",
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
  let activity_number = 1;
  if (activities_data.length !== 0)
    activity_number = activities_data[0].dataValues.order + 1;

  // Set Title
  let title = req.body.title;
  if (req.body.type === "question") {
    title = "Pergunta";
  }
  if (req.body.type === "game") {
    title = "Jogo A Cor do Som";
  }

  // Create a Activity
  const activity = {
    type: req.body.type,
    order: activity_number,
    activitygroup_id: req.body.activitygroup_id,
    title: title,
  };

  // Save Activity in the database
  Activity.create(activity)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Activity.",
      });
    });
};

// Retrieve an activity from the database.
exports.findOne = (req, res) => {
  const id = req.params.id;

  // Get activity
  Activity.findOne({
    where: {
      id: id,
    },
    include: [
      {
        model: ActivityGroup,
        as: "activitygroup",
        where: { class_id: req.params.class_id },
      },
      {
        model: ActivityType,
        as: "activitytype",
      },
    ],
  })
    .then(async (activity) => {
      if (activity === null) {
        res.status(400).send({
          message: "Activity not found.",
        });
        return;
      }

      activity = activity.toJSON();
      switch (activity.activitytype.id) {
        case 1:
          activity = await getMediaActivityInfo(activity, req.userId);
          break;
        case 2:
          activity = await getExerciseActivityInfo(activity, req.userId);
          break;
        case 3:
          activity = await getQuestionActivityInfo(activity, req.userId);
          break;
        case 4:
          activity = await getGameActivityInfo(activity, req.userId);
          break;
      }

      res.send(activity);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving the Activity.",
      });
    });
};

exports.getCompletedActivities = (req, res) => {
  
  CompletedActivity.findAll({
    where: {
      user_id: req.userId
    }
  })
  .then((data) => {
    res.status(200).send({
      completed_activities: data.length
    })
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving Activities.",
    });
  })

}

// Retrieve all activities from the database.
exports.findAll = (req, res) => {
  const activitygroup_id = req.query.activitygroup_id;

  Activity.findAll({
    include: [
      {
        model: ActivityGroup,
        as: "activitygroup",
        where: {
          id: activitygroup_id,
          class_id: req.params.class_id,
        },
      },
      {
        model: ActivityType,
        as: "activitytype",
      },
    ],
    order: [["order", "ASC"]],
  })
    .then(async (_data) => {
      let data = [];
      for (let idx in _data) {
        let activity = _data[idx].toJSON();

        let completed_activity = await CompletedActivity.findOne({
          where: {
            user_id: req.userId,
            activity_id: activity.id,
          },
        });

        if (completed_activity === null) {
          activity.completed = false;
        } else {
          activity.completed = true;
        }

        if (activity.activitytype.id === 4) {
          let game_activity_type = await GameActivity.findOne({
            where: {
              activity_id: activity.id,
            },
            include: [
              {
                model: GameMode,
                as: "gamemode",
              },
            ],
          });
          activity.game_activity = { mode: game_activity_type.gamemode.name };
        }
        data.push(activity);
      }

      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Activities.",
      });
    });
};

// Update the order of all activities of a activitygroup
exports.change_order = async (req, res) => {
  const new_order = req.body.new_order;
  const activitygroup_id = req.body.activitygroup_id;

  if (!new_order || !activitygroup_id) {
    res.status(400).send({
      message: "new_order and activitygroup_id can not be empty!",
    });
    return;
  }

  // Check new order
  const _old_order = await Activity.findAll({
    where: {
      activitygroup_id: activitygroup_id,
    },
    order: [["order", "ASC"]],
    attributes: ["id"],
    raw: true,
  });
  if (_old_order.length < 2) {
    res.status(400).send({
      message: "Impossible to reorder, there are only zero or one Activities!",
    });
    return;
  }
  const old_order = _old_order.map((item) => item.id);
  let sorted_new_order = [...new_order].sort();
  if (old_order.sort().join(",") !== sorted_new_order.join(",")) {
    res.status(400).send({
      message: "Wrong Activities ids.",
    });
    return;
  }

  try {
    await sequelize.transaction(async (t) => {
      let order = 1;
      for (let activity_id of new_order) {
        await Activity.update(
          { order: order },
          { where: { id: activity_id }, transaction: t }
        );
        order++;
      }
    });

    res.send({
      message: `Order was changed successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not change order of Activities.",
    });
  }
};

// Delete a activity from the database.
exports.delete = async (req, res) => {
  const id = req.params.id;
  const activitygroup_id = req.body.activitygroup_id;

  try {
    const result = await sequelize.transaction(async (t) => {
      // Get the activity number of the activity to be deleted
      const activity_to_delete = await Activity.findOne(
        {
          where: { id: id },
          include: [
            {
              model: ActivityGroup,
              as: "activitygroup",
              where: { id: activitygroup_id, class_id: req.params.class_id },
            },
          ],
        },
        { transaction: t }
      );
      if (activity_to_delete === null)
        throw new Error(
          `Cannot delete Activity with id=${id}. Maybe Activity was not found!`
        );
      const activity_number_to_delete = activity_to_delete.order;

      // Delete the activity
      await activity_to_delete.destroy({
        transaction: t,
      });

      // Get the activities that had a higher order to update them
      const remaining_activities = await Activity.findAll({
        where: {
          order: { [Op.gt]: `${activity_number_to_delete}` },
          activitygroup_id: activitygroup_id,
        },
        transaction: t,
      });

      // Update each activity_number by decreasing one
      for (let idx in remaining_activities) {
        let activity = remaining_activities[idx];
        await Activity.update(
          { order: activity.order - 1 },
          { where: { id: activity.id }, transaction: t }
        );
      }
      
      await CompletedActivity.destroy({
        where: {
          activity_id: id
        },
        transaction: t
      })

      return activity_to_delete;
    });

    res.send({
      message: `Activity with id=${result.id} was deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not delete Activity with id=" + id,
    });
  }
};

// Retrieve activities of a specific activitygroup of a student
exports.getActivitiesOfActivityGroupOfStudent = async (req, res) => {
  const class_id = req.params.class_id;
  const activitygroup_id = req.params.activitygroup_id;
  const student_id = req.params.student_id;

  // Get Student
  let student;
  try {
    student = await User.findByPk(student_id);
  } catch (err) {
    res.status(400).send({
      message: err.message || "Some error occured while searching the student.",
    });
  }
  if (student === null) {
    res.status(400).send({
      message: err.message || "Student not found.",
    });
  }

  Activity.findAll({
    include: [
      {
        model: ActivityGroup,
        as: "activitygroup",
        where: {
          id: activitygroup_id,
          class_id: class_id,
        },
      },
      {
        model: ActivityType,
        as: "activitytype",
      },
    ],
    order: [["order", "ASC"]],
  })
    .then(async (_data) => {
      let data = {
        activities: [],
        first_name: student.first_name,
        last_name: student.last_name,
      };
      if (_data.length !== 0) {
        data.name = _data[0].activitygroup.name;
        for (let idx in _data) {
          let activity = {
            id: _data[idx].id,
            order: _data[idx].order,
            activitygroup_id: _data[idx].activitygroup_id,
            title: _data[idx].title,
            createdAt: _data[idx].createdAt,
            updatedAt: _data[idx].updatedAt,
            activitytype: {
              id: _data[idx].activitytype.id,
              name: _data[idx].activitytype.name,
            },
          };

          let completed_activity = await CompletedActivity.findOne({
            where: {
              user_id: student_id,
              activity_id: activity.id,
            },
          });

          if (completed_activity === null) {
            activity.completed = false;
          } else {
            activity.completed = true;
          }

          if (activity.activitytype.id === 4) {
            let game_activity_type = await GameActivity.findOne({
              where: {
                activity_id: activity.id,
              },
              include: [
                {
                  model: GameMode,
                  as: "gamemode",
                },
              ],
            });
            activity.game_activity = { mode: game_activity_type.gamemode.name };
          }
          data.activities.push(activity);
        }
      }

      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Activities.",
      });
    });
};

// Retrieve activity of a student
exports.getActivityOfStudent = async (req, res) => {
  const class_id = req.params.class_id;
  const activitygroup_id = req.params.activitygroup_id;
  const activity_id = req.params.activity_id;
  const student_id = req.params.student_id;

  // Get Student
  let student;
  try {
    student = await User.findByPk(student_id);
  } catch (err) {
    res.status(400).send({
      message: err.message || "Some error occured while searching the student.",
    });
  }
  if (student === null) {
    res.status(400).send({
      message: err.message || "Student not found.",
    });
  }

  Activity.findOne({
    where: {
      id: activity_id,
    },
    include: [
      {
        model: ActivityGroup,
        as: "activitygroup",
        where: {
          id: activitygroup_id,
          class_id: class_id,
        },
      },
      {
        model: ActivityType,
        as: "activitytype",
      },
    ],
  })
    .then(async (activity) => {
      if (activity === null) {
        res.status(400).send({
          message: "Activity not found.",
        });
        return;
      }
      let final_data = {
        first_name: student.first_name,
        last_name: student.last_name,
        name: activity.activitygroup.name,
        activity: activity.toJSON()
      };

      switch (final_data.activity.activitytype.id) {
        case 1:
          final_data.activity = await getMediaActivityInfo(final_data.activity, student_id);
          break;
        case 2:
          final_data.activity = await getExerciseActivityInfo(final_data.activity, student_id);
          break;
        case 3:
          final_data.activity = await getQuestionActivityInfo(final_data.activity, student_id);
          break;
        case 4:
          final_data.activity = await getGameActivityInfo(final_data.activity, student_id);
          break;
      }
      
      res.send(final_data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving the Activity.",
      });
    });
};

const getMediaActivityInfo = async (activity, user_id) => {
  let media_info = await MediaActivity.findOne({
    where: {
      activity_id: activity.id,
    },
    attributes: ["media_type"],
  });
  let media_activity_status = await MediaActivityStatus.findOne({
    where: {
      activity_id: activity.id,
      user_id: user_id,
    },
  });
  if (media_activity_status !== null) {
    activity.completed = true;
  }
  activity.media_activity = media_info;
  return activity;
};

const getExerciseActivityInfo = async (activity, user_id) => {
  let exercise_info = await ExerciseActivity.findOne({
    where: {
      activity_id: activity.id,
    },
    attributes: ["media_type"],
  });
  let exercise_activity_status = await ExerciseActivityStatus.findOne({
    where: {
      activity_id: activity.id,
      user_id: user_id,
    },
  });
  if (exercise_activity_status !== null) {
    activity.completed = true;
    activity.teacher_feedback = exercise_activity_status.teacher_feedback;
    if (exercise_activity_status.trophy_id !== null) {
      // Get trophy name
      let trophy = await Trophy.findByPk(exercise_activity_status.trophy_id);
      activity.trophy = {
        id: exercise_activity_status.trophy_id,
        name: trophy.name,
        updatedAt: exercise_activity_status.updatedAt
      }
    }
  }
  activity.exercise_activity = exercise_info;
  return activity;
};

const getQuestionActivityInfo = async (activity, user_id) => {
  let question_info = await QuestionActivity.findOne({
    where: {
      activity_id: activity.id,
    },
    include: [
      {
        model: Answer,
        attributes: ["order", "answer", "media_type"],
      },
    ],
  });
  let question_activity_status = await QuestionActivityStatus.findOne({
    where: {
      activity_id: activity.id,
      user_id: user_id,
    },
  });
  let answers = question_info.Answers.map((item) => item.toJSON());
  if (question_activity_status !== null) {
    activity.teacher_feedback = question_activity_status.teacher_feedback;
    if (question_activity_status.trophy_id !== null) {
      // Get trophy name
      let trophy = await Trophy.findByPk(question_activity_status.trophy_id);
      activity.trophy = {
        id: question_activity_status.trophy_id,
        name: trophy.name,
        updatedAt: question_activity_status.updatedAt
      }
    }
    let chosen_answers = await UserAnswered.findAll({
      where: {
        status_id: question_activity_status.id,
      },
      attributes: ["status_id", "order"]
    });
    activity.completed = true;
    for (let idx in chosen_answers) {
      let chosen_answer = chosen_answers[idx];
      const itemToUpdate = answers.find(
        (item) => item.order == chosen_answer.order
      );
      if (itemToUpdate) {
        itemToUpdate.chosen = true;
      }
    }
  }
  activity.question_activity = {
    question: question_info.question,
    answers: answers,
    media_type: question_info.media_type,
    one_answer_only: question_info.one_answer_only,
  };
  return activity;
};

const getGameActivityInfo = async (activity, user_id) => {
  let game_info = await GameActivity.findOne({
    where: {
      activity_id: activity.id,
    },
    include: [
      {
        model: MusicalNote,
        attributes: [
          "id",
          "order",
          "name",
          "violin_string",
          "violin_finger",
          "viola_string",
          "viola_finger",
          "note_code",
          "type",
        ],
      },
    ],
    order: [[MusicalNote, "order", "ASC"]],
  });

  switch (game_info.gamemode_id) {
    case 1:
      activity.game_activity = {
        mode: "Identify",
        notes: game_info.MusicalNotes,
      };
      let identify_mode_status = await IdentifyModeStatus.findOne({
        where: {
          activity_id: activity.id,
          user_id: user_id,
        },
      });
      if (identify_mode_status !== null) {
        activity.completed = true;
        activity.teacher_feedback = identify_mode_status.teacher_feedback;
        if (identify_mode_status.trophy_id !== null) {
          // Get trophy name
          let trophy = await Trophy.findByPk(identify_mode_status.trophy_id);
          activity.trophy = {
            id: identify_mode_status.trophy_id,
            name: trophy.name,
            updatedAt: identify_mode_status.updatedAt
          }
        }
      }
      break;
    case 2:
      activity.game_activity = {
        mode: "Play",
        notes: game_info.MusicalNotes,
      };
      let play_mode_status = await PlayModeStatus.findOne({
        where: {
          activity_id: activity.id,
          user_id: user_id,
        },
      });
      if (play_mode_status !== null) {
        activity.completed = true;
        activity.teacher_feedback = play_mode_status.teacher_feedback;
        if (play_mode_status.trophy_id !== null) {
          // Get trophy name
          let trophy = await Trophy.findByPk(play_mode_status.trophy_id);
          activity.trophy = {
            id: play_mode_status.trophy_id,
            name: trophy.name,
            updatedAt: play_mode_status.updatedAt
          }
        }
      }
      break;
    case 3:
      let build_mode = await BuildMode.findOne({
        where: {
          activity_id: activity.id,
        },
      });
      activity.game_activity = {
        mode: "Build",
        notes: game_info.MusicalNotes,
        sequence_length: build_mode.sequence_length,
      };
      let build_mode_status = await BuildModeStatus.findOne({
        where: {
          activity_id: activity.id,
          user_id: user_id,
        },
      });
      if (build_mode_status !== null) {
        activity.completed = true;
        activity.teacher_feedback = build_mode_status.teacher_feedback;
        if (build_mode_status.trophy_id !== null) {
          // Get trophy name
          let trophy = await Trophy.findByPk(build_mode_status.trophy_id);
          activity.trophy = {
            id: build_mode_status.trophy_id,
            name: trophy.name,
            updatedAt: build_mode_status.updatedAt
          }
        }
        let user_chosen_notes = await UserChosenNotes.findAll({
          where: {
            status_id: build_mode_status.id,
          },
          attributes: ["order", "note_id"],
          order: [["order", "ASC"]],
        });
        activity.game_activity.chosen_notes = user_chosen_notes;
      }
      break;
  }
  return activity;
};