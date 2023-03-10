module.exports = (sequelize, Sequelize) => {
    const MediaActivity = sequelize.define("MediaActivities", {
        activity_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        media_id: {
            type: Sequelize.STRING,
        },
        media_type: {
            type: Sequelize.STRING,
        },
        media_secret: {
            type: Sequelize.STRING,
        }
    });

    return MediaActivity;
};