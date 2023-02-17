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
db.weekcontents = require("./weekcontent.model.js")(sequelize, Sequelize);
db.activities = require("./activities.model.js")(sequelize, Sequelize);

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
// Class 1 - * WeekContent
db.weekcontents.belongsTo(db.classes, {
  through: "class",
  foreignKey: { name: "class_id", allowNull: false },
  as: "class",
});

db.activities.belongsTo(db.weekcontents, {
  through: "weekcontent",
  foreignKey: { name: "weekcontent_id", allowNull: false },
  as: "weekcontent",
});

db.ROLES = ["student", "teacher"];

module.exports = db;
