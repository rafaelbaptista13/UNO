module.exports = (sequelize, Sequelize) => {
    const BuildModeStatus = sequelize.define("BuildModeStatus", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        activity_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
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
        },
        teacher_feedback: {
            type: Sequelize.STRING,
            allowNull: true
        }
    });

    return BuildModeStatus;
};