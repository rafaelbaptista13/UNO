module.exports = (sequelize, Sequelize) => {
  const MusicalNote = sequelize.define("MusicalNotes", {
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
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    violin_string: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    violin_finger: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    viola_string: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    viola_finger: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    note_code: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  return MusicalNote;
};
