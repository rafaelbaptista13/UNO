module.exports = (sequelize, Sequelize) => {
    const IdentifyModeStatus = sequelize.define("IdentifyModeStatus", {
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
        teacher_feedback: {
            type: Sequelize.STRING,
            allowNull: true
        }
    });

    return IdentifyModeStatus;
};