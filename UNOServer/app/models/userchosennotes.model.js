module.exports = (sequelize, Sequelize) => {
    const UserChosenNotes = sequelize.define("UserChosenNotes", {
        status_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        order: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        note_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });

    return UserChosenNotes;
};