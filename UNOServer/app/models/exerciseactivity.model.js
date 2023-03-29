module.exports = (sequelize, Sequelize) => {
    const ExerciseActivity = sequelize.define("ExerciseActivities", {
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

    return ExerciseActivity;
};