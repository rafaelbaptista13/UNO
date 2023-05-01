const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.model.js")(sequelize, Sequelize);
db.roles = require("./role.model.js")(sequelize, Sequelize);
db.classes = require("./class.model")(sequelize, Sequelize);
db.classusers = require("./classusers.model")(sequelize, Sequelize);
db.activitygroups = require("./activitygroups.model.js")(sequelize, Sequelize);
db.activities = require("./activities.model.js")(sequelize, Sequelize);
db.activitytypes = require("./activitytype.model")(sequelize, Sequelize);
db.mediaactivities = require("./mediaactivity.model")(sequelize, Sequelize);
db.mediaactivitystatus = require("./mediaactivitystatus.model")(
  sequelize,
  Sequelize
);
db.exerciseactivities = require("./exerciseactivity.model")(
  sequelize,
  Sequelize
);
db.exerciseactivitystatus = require("./exerciseactivitystatus.model")(
  sequelize,
  Sequelize
);
db.questionactivities = require("./questionactivity.model")(
  sequelize,
  Sequelize
);
db.answers = require("./answer.model")(sequelize, Sequelize);
db.questionactivitystatus = require("./questionactivitystatus.model")(
  sequelize,
  Sequelize
);
db.useranswered = require("./useranswered.model")(sequelize, Sequelize);
db.gamemodes = require("./gamemode.model")(sequelize, Sequelize);
db.gameactivities = require("./gameactivity.model")(sequelize, Sequelize);
db.playmode = require("./playmode.model")(sequelize, Sequelize);
db.musicalnotes = require("./musicalnote.model")(sequelize, Sequelize);
db.playmodestatus = require("./playmodestatus.model")(sequelize, Sequelize);
db.identifymodestatus = require("./identifymodestatus.model")(
  sequelize,
  Sequelize
);
db.identifymode = require("./identifymode.model")(sequelize, Sequelize);
db.buildmode = require("./buildmode.model")(sequelize, Sequelize);
db.buildmodestatus = require("./buildmodestatus.model")(sequelize, Sequelize);
db.userchosennotes = require("./userchosennotes.model")(sequelize, Sequelize);
db.completedactivities = require("./completedactivities.model")(sequelize, Sequelize);
db.supportmaterials = require("./supportmaterials.model")(sequelize, Sequelize);

db.roles.belongsToMany(db.users, {
  through: "UserRoles",
  foreignKey: "roleId",
  otherKey: "userId",
});
db.users.belongsToMany(db.roles, {
  through: "UserRoles",
  foreignKey: "userId",
  otherKey: "roleId",
});
// User * - * Class
db.users.belongsToMany(db.classes, {
  through: db.classusers,
});
db.classes.belongsToMany(db.users, {
  through: db.classusers,
});
// Class 1 - * ActivityGroup
db.activitygroups.belongsTo(db.classes, {
  through: "class",
  foreignKey: { name: "class_id", allowNull: false },
  as: "class",
});

db.activities.belongsTo(db.activitygroups, {
  through: "activitygroup",
  foreignKey: { name: "activitygroup_id", allowNull: false },
  as: "activitygroup",
});

// Activity * - 1 ActivityType
db.activities.belongsTo(db.activitytypes, {
  through: "activitytype",
  foreignKey: { name: "activitytype_id", allowNull: false },
  as: "activitytype",
});

// MediaActivity 1 - 1 Activity
db.activities.hasOne(db.mediaactivities, {
  foreignKey: "activity_id",
  onDelete: "CASCADE",
});

// MediaActivityStatus 1 - 1 MediaActivity
db.mediaactivities.hasOne(db.mediaactivitystatus, {
  foreignKey: "activity_id",
  onDelete: "CASCADE",
});

// mediaactivitystatus * - 1 User
db.mediaactivitystatus.belongsTo(db.users, {
  foreignKey: "user_id",
});

// ExerciseActivity 1 - 1 Activity
db.activities.hasOne(db.exerciseactivities, {
  foreignKey: "activity_id",
  onDelete: "CASCADE",
});

// ExerciseActivityStatus 1 - 1 ExerciseActivity
db.exerciseactivities.hasOne(db.exerciseactivitystatus, {
  foreignKey: "activity_id",
  onDelete: "CASCADE",
});

// ExerciseActivityStatus * - 1 User
db.exerciseactivitystatus.belongsTo(db.users, {
  foreignKey: "user_id",
});

// QuestionActivity 1 - 1 Activity
db.activities.hasOne(db.questionactivities, {
  foreignKey: "activity_id",
  onDelete: "CASCADE",
});

// Answer * - 1 QuestionActivity
db.answers.belongsTo(db.questionactivities, {
  foreignKey: "activity_id",
  onDelete: "CASCADE",
});

// QuestionActivity 1 - * Answer
db.questionactivities.hasMany(db.answers, {
  foreignKey: "activity_id",
});

// QuestionActivityStatus 1 - 1 QuestionActivity
db.questionactivities.hasOne(db.questionactivitystatus, {
  foreignKey: "activity_id",
  onDelete: "CASCADE",
});

// QuestionActivityStatus * - 1 User
db.questionactivitystatus.belongsTo(db.users, {
  foreignKey: "user_id",
});

db.answers.belongsToMany(db.questionactivitystatus, {
  through: db.useranswered,
  otherKey: "status_id",
  targetKey: "id",
});

// QuestionActivityStatus 1 - * Answer
db.questionactivitystatus.belongsToMany(db.answers, {
  through: db.useranswered,
  foreignKey: "status_id",
  otherKey: "order",
});

// GameActivity 1 - 1 Activity
db.activities.hasOne(db.gameactivities, {
  foreignKey: "activity_id",
  onDelete: "CASCADE",
});

// GameActivity * - 1 GameMode
db.gameactivities.belongsTo(db.gamemodes, {
  through: "gamemode",
  foreignKey: { name: "gamemode_id", allowNull: false },
  as: "gamemode",
});

// GameActivity 1 - * MusicalNote
db.gameactivities.hasMany(db.musicalnotes, {
  foreignKey: "activity_id",
});

// MusicalNote * - 1 GameActivity
db.musicalnotes.belongsTo(db.gameactivities, {
  foreignKey: "activity_id",
  onDelete: "CASCADE",
});

// PlayMode 1 - 1 GameActivity
db.gameactivities.hasOne(db.playmode, {
  foreignKey: "activity_id",
  onDelete: "CASCADE",
});

// PlayModeStatus 1 - 1 PlayMode
db.playmode.hasOne(db.playmodestatus, {
  foreignKey: "activity_id",
  onDelete: "CASCADE",
});

// PlayModeStatus * - 1 User
db.playmodestatus.belongsTo(db.users, {
  foreignKey: "user_id",
});

// IdentifyMode 1 - 1 GameActivity
db.gameactivities.hasOne(db.identifymode, {
  foreignKey: "activity_id",
  onDelete: "CASCADE",
});

// IdentifyModeStatus 1 - 1 IdentifyMode
db.identifymode.hasOne(db.identifymodestatus, {
  foreignKey: "activity_id",
  onDelete: "CASCADE",
});

// IdentifyModeStatus * - 1 User
db.identifymodestatus.belongsTo(db.users, {
  foreignKey: "user_id",
});

// BuildMode 1 - 1 GameActivity
db.gameactivities.hasOne(db.buildmode, {
  foreignKey: "activity_id",
  onDelete: "CASCADE",
});

// BuildModeStatus 1 - BuildMode
db.buildmode.hasOne(db.buildmodestatus, {
  foreignKey: "activity_id",
  onDelete: "CASCADE"
})

// BuildModeStatus * - 1 User
db.buildmodestatus.belongsTo(db.users, {
  foreignKey: "user_id",
})

db.musicalnotes.belongsToMany(db.buildmodestatus, {
  through: {
    model: db.userchosennotes,
    unique: false
  },
  foreignKey: "note_id",
  otherKey: "status_id",
});

// BuildModeStatus * - * MusicalNotes
db.buildmodestatus.belongsToMany(db.musicalnotes, {
  through: {
    model: db.userchosennotes,
    unique: false
  },
  foreignKey: "status_id",
  otherKey: "note_id",
});


// Completed Activities trigger
db.mediaactivitystatus.afterCreate((status, options) => {
  return db.completedactivities.create({
    activity_id: status.activity_id,
    user_id: status.user_id
  })
});
db.exerciseactivitystatus.afterCreate((status, options) => {
  return db.completedactivities.create({
    activity_id: status.activity_id,
    user_id: status.user_id
  })
});
db.questionactivitystatus.afterCreate((status, options) => {
  return db.completedactivities.create({
    activity_id: status.activity_id,
    user_id: status.user_id
  })
});
db.identifymodestatus.afterCreate((status, options) => {
  return db.completedactivities.create({
    activity_id: status.activity_id,
    user_id: status.user_id
  })
});
db.playmodestatus.afterCreate((status, options) => {
  return db.completedactivities.create({
    activity_id: status.activity_id,
    user_id: status.user_id
  })
});
db.buildmodestatus.afterCreate((status, options) => {
  return db.completedactivities.create({
    activity_id: status.activity_id,
    user_id: status.user_id
  })
});

// Delete Activities trigger
db.activities.beforeDestroy((activity, options) => {
  return db.completedactivities.destroy({
    where: {
      activity_id: activity.id
    }
  })
})
db.users.beforeDestroy((user, options) => {
  return db.completedactivities.destroy({
    where: {
      user_id: user.id
    }
  })
})

// SupportMaterial * - 1 Class
db.supportmaterials.belongsTo(db.classes, {
  through: "class",
  foreignKey: { name: "class_id", allowNull: false },
  as: "class",
})

db.ROLES = ["student", "teacher"];

module.exports = db;
