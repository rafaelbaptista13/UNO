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
db.mediaactivitystatus = require("./mediaactivitystatus.model")(sequelize, Sequelize);
db.exerciseactivities = require("./exerciseactivity.model")(sequelize, Sequelize);
db.exerciseactivitystatus = require("./exerciseactivitystatus.model")(sequelize, Sequelize);
db.questionactivities = require("./questionactivity.model")(sequelize, Sequelize);
db.answers = require("./answer.model")(sequelize, Sequelize);
db.questionactivitystatus = require("./questionactivitystatus.model")(sequelize, Sequelize);
db.useranswered = require("./useranswered.model")(sequelize, Sequelize);
db.gamemodes = require("./gamemode.model")(sequelize, Sequelize);
db.gameactivities = require("./gameactivity.model")(sequelize, Sequelize);
db.playmode = require("./playmode.model")(sequelize, Sequelize);
db.musicalnotes = require("./musicalnote.model")(sequelize, Sequelize);

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
  onDelete: "CASCADE"
})

// MediaActivityStatus 1 - 1 MediaActivity
db.mediaactivities.hasOne(db.mediaactivitystatus, {
  foreignKey: "activity_id",
  onDelete: "CASCADE"
})

// mediaactivitystatus * - 1 User
db.mediaactivitystatus.belongsTo(db.users, {
  foreignKey: "user_id",
})

// ExerciseActivity 1 - 1 Activity
db.activities.hasOne(db.exerciseactivities, {
  foreignKey: "activity_id",
  onDelete: "CASCADE"
})

// ExerciseActivityStatus 1 - 1 ExerciseActivity
db.exerciseactivities.hasOne(db.exerciseactivitystatus, {
  foreignKey: "activity_id",
  onDelete: "CASCADE"
})

// ExerciseActivityStatus * - 1 User
db.exerciseactivitystatus.belongsTo(db.users, {
  foreignKey: "user_id",
})

// QuestionActivity 1 - 1 Activity
db.activities.hasOne(db.questionactivities, {
  foreignKey: "activity_id",
  onDelete: "CASCADE"
})

// Answer * - 1 QuestionActivity
db.answers.belongsTo(db.questionactivities, {
  foreignKey: "activity_id",
  onDelete: "CASCADE"
})

// QuestionActivity 1 - * Answer
db.questionactivities.hasMany(db.answers, {
  foreignKey: "activity_id"
})

// QuestionActivityStatus 1 - 1 QuestionActivity 
db.questionactivities.hasOne(db.questionactivitystatus, {
  foreignKey: "activity_id",
  onDelete: "CASCADE"
})

// QuestionActivityStatus * - 1 User
db.questionactivitystatus.belongsTo(db.users, {
  foreignKey: "user_id",
})

db.answers.belongsToMany(db.questionactivitystatus, {
  through: db.useranswered,
  foreignKey: "order",
  otherKey: "status_id",
  sourceKey: "order",
  targetKey: "id"
})

// QuestionActivityStatus 1 - * Answer
db.questionactivitystatus.belongsToMany(db.answers, {
  through: db.useranswered,
  foreignKey: "status_id",
  otherKey: "order",
  sourceKey: "id",
  targetKey: "order"
})

// GameActivity 1 - 1 Activity
db.activities.hasOne(db.gameactivities, {
  foreignKey: "activity_id",
  onDelete: "CASCADE"
})

// GameActivity * - 1 GameMode
db.gameactivities.belongsTo(db.gamemodes, {
  through: "gamemode",
  foreignKey: { name: "gamemode_id", allowNull: false },
  as: "gamemode",
});

// PlayMode 1 - 1 GameActivity
db.gameactivities.hasOne(db.playmode, {
  foreignKey: "activity_id",
  onDelete: "CASCADE"
})

// MusicalNote * - 1 PlayMode
db.musicalnotes.belongsTo(db.playmode, {
  foreignKey: "activity_id",
  onDelete: "CASCADE"
})

// PlayMode 1 - * MusicalNote
db.playmode.hasMany(db.musicalnotes, {
  foreignKey: "activity_id"
})

db.ROLES = ["student", "teacher"];

module.exports = db;
