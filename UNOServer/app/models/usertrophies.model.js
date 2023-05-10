module.exports = (sequelize, Sequelize) => {
  const UserTrophy = sequelize.define("UserTrophies", {
    count: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });

  return UserTrophy;
};
