module.exports = (sequelize, Sequelize) => {
    const QuestionActivityStatus = sequelize.define("QuestionActivityStatus", {
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
        teacher_feedback: {
            type: Sequelize.STRING,
            allowNull: true
        }
    });

    return QuestionActivityStatus;
};