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
db.exerciseactivities = require("./exerciseactivity.model")(sequelize, Sequelize);
db.exerciseactivitystatus = require("./exerciseactivitystatus.model")(sequelize, Sequelize);

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

db.ROLES = ["student", "teacher"];

module.exports = db;
