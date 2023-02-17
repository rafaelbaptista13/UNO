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
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.model.js")(sequelize, Sequelize);
db.roles = require("./role.model.js")(sequelize, Sequelize);
db.refreshToken = require("../models/refreshToken.model.js")(sequelize, Sequelize);
db.weekcontents = require("./weekcontent.model.js")(sequelize, Sequelize);
db.activities = require("./activities.model.js")(sequelize, Sequelize);

db.roles.belongsToMany(db.users, {
  through: "UserRoles",
  foreignKey: "roleId",
  otherKey: "userId"
});
db.users.belongsToMany(db.roles, {
  through: "UserRoles",
  foreignKey: "userId",
  otherKey: "roleId"
});
db.refreshToken.belongsTo(db.users, {
  foreignKey: 'userId', targetKey: 'id'
});
db.users.hasOne(db.refreshToken, {
  foreignKey: 'userId', targetKey: 'id'
});
db.activities.belongsTo(db.weekcontents, {through: "weekcontent", foreignKey: "weekcontent_id", as: "weekcontent"});

db.ROLES = ["student", "teacher"]

module.exports = db;
