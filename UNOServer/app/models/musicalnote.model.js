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
        },
        violin_string: {
            type: Sequelize.INTEGER,
        },
        violin_finger: {
            type: Sequelize.INTEGER,
        },
        viola_string: {
            type: Sequelize.INTEGER,
        },
        viola_finger: {
            type: Sequelize.INTEGER,
        },
    });

    return MusicalNote;
};
