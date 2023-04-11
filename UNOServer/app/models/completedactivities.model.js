module.exports = (sequelize, Sequelize) => {
    const CompletedActivities = sequelize.define("CompletedActivities", {
        activity_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    });

    return CompletedActivities;
};