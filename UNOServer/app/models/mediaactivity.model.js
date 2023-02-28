module.exports = (sequelize, Sequelize) => {
    const MediaActivity = sequelize.define("MediaActivities", {
        activity_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        media_id: {
            type: Sequelize.STRING,
            allowNull: false
        },
        media_type: {
            type: Sequelize.STRING,
            allowNull: false
        },
        media_secret: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });

    return MediaActivity;
};