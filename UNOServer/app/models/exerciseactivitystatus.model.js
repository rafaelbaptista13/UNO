module.exports = (sequelize, Sequelize) => {
    const ExerciseActivityStatus = sequelize.define("ExerciseActivityStatus", {
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

    return ExerciseActivityStatus;
};