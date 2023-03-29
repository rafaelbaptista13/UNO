module.exports = (sequelize, Sequelize) => {
    const QuestionActivity = sequelize.define("QuestionActivities", {
        activity_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        question: {
            type: Sequelize.STRING,
            allowNull: false
        },
        one_answer_only: {
            type: Sequelize.BOOLEAN,
            allowNull: false
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

    return QuestionActivity;
};