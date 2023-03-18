module.exports = (sequelize, Sequelize) => {
  const Answer = sequelize.define(
    "Answers",
    {
      activity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      answer: {
        type: Sequelize.STRING,
      },
      media_id: {
        type: Sequelize.STRING,
      },
      media_type: {
        type: Sequelize.STRING,
      },
      media_secret: {
        type: Sequelize.STRING,
      },
    },
    {
      indexes: [
        {
          fields: ["order"],
          name: "order",
        },
      ],
    }
  );

  return Answer;
};
