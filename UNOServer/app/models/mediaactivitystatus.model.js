module.exports = (sequelize, Sequelize) => {
    const MediaActivityStatus = sequelize.define("MediaActivityStatus", {
        activity_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
    });

    return MediaActivityStatus;
};