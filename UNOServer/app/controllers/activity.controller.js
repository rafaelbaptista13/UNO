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
          let media_info = await MediaActivity.findOne({
            where: {
              activity_id: activity.id,
            },
            attributes: ["media_type"],
          });
          let media_activity_status = await MediaActivityStatus.findOne({
            where: {
              activity_id: activity.id,
              user_id: req.userId,
            },
          });
          if (media_activity_status !== null) {
            activity.completed = true;
          }
          activity.media_activity = media_info;
          break;
        case 2:
          let exercise_info = await ExerciseActivity.findOne({
            where: {
              activity_id: activity.id,
            },
            attributes: ["media_type"],
          });
          let exercise_activity_status = await ExerciseActivityStatus.findOne({
            where: {
              activity_id: activity.id,
              user_id: req.userId,
            },
          });
          if (exercise_activity_status !== null) {
            activity.completed = true;
          }
          activity.exercise_activity = exercise_info;
          break;
        case 3:
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
              user_id: req.userId,
            },
          });
          let answers = question_info.Answers.map((item) => item.toJSON());
          if (question_activity_status !== null) {
            let chosen_answers = await UserAnswered.findAll({
              where: {
                status_id: question_activity_status.id,
              },
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
          };
          break;
        case 4:
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
                  "type"
                ],
              },
            ],
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
                  user_id: req.userId,
                },
              });
              if (identify_mode_status !== null) {
                activity.completed = true;
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
                  user_id: req.userId,
                },
              });
              if (play_mode_status !== null) {
                activity.completed = true;
              }
              break;
            case 3:
              let build_mode = await BuildMode.findOne({
                where: {
                  activity_id: activity.id
                }
              })
              activity.game_activity = {
                mode: "Build",
                notes: game_info.MusicalNotes,
                sequence_length: build_mode.sequence_length
              };
              let build_mode_status = await BuildModeStatus.findOne({
                where: {
                  activity_id: activity.id,
                  user_id: req.userId,
                },
              });
              if (build_mode_status !== null) {
                activity.completed = true;
                let user_chosen_notes = await UserChosenNotes.findAll({
                  where: {
                    status_id: build_mode_status.id
                  },
                  attributes: [
                    "order",
                    "note_id"
                  ]
                })
                activity.game_activity.chosen_notes = user_chosen_notes;
              }
              break;
          }

          break;
      }

      res.send(activity);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving the Activity.",
      });
    });
};

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

        switch (activity.activitytype.id) {
          case 1:
            let media_activity_status = await MediaActivityStatus.findOne({
              where: {
                activity_id: activity.id,
                user_id: req.userId,
              },
            });
            if (media_activity_status === null) {
              activity.completed = false;
            } else {
              activity.completed = true;
            }
            break;
          case 2:
            let exercise_activity_status = await ExerciseActivityStatus.findOne(
              {
                where: {
                  activity_id: activity.id,
                  user_id: req.userId,
                },
              }
            );
            if (exercise_activity_status === null) {
              activity.completed = false;
            } else {
              activity.completed = true;
            }
            break;
          case 3:
            let question_activity_status = await QuestionActivityStatus.findOne(
              {
                where: {
                  activity_id: activity.id,
                  user_id: req.userId,
                },
              }
            );
            if (question_activity_status === null) {
              activity.completed = false;
            } else {
              activity.completed = true;
            }
            break;
          case 4:
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
            if (game_activity_type.gamemode.id === 1) {
              let identify_mode_status = await IdentifyModeStatus.findOne({
                where: {
                  activity_id: activity.id,
                  user_id: req.userId,
                },
              });
              if (identify_mode_status === null) {
                activity.completed = false;
              } else {
                activity.completed = true;
              }
            } else if (game_activity_type.gamemode.id === 2) {
              let play_mode_status = await PlayModeStatus.findOne({
                where: {
                  activity_id: activity.id,
                  user_id: req.userId,
                },
              });
              if (play_mode_status === null) {
                activity.completed = false;
              } else {
                activity.completed = true;
              }
            } else if (game_activity_type.gamemode.id === 3) {
              let build_mode_status = await BuildModeStatus.findOne({
                where: {
                  activity_id: activity.id,
                  user_id: req.userId
                }
              });
              if (build_mode_status === null) {
                activity.completed = false;
              } else {
                activity.completed = true;
              }
            }
            break;
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

// Update a Activity by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  // Find Activity
  Activity.findOne({
    where: { id: id },
    include: [
      {
        model: ActivityGroup,
        as: "activitygroup",
        where: { class_id: req.params.class_id },
      },
    ],
  })
    .then((activity) => {
      if (activity === null) throw new Error();
      activity.update(req.body).then((num) => {
        res.send({
          message: "Activity was updated successfully.",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        message: "Error updating Activity with id=" + id,
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
