module.exports = (sequelize, Sequelize) => {
    const GameActivity = sequelize.define("GameActivities", {
        activity_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
    });

    return GameActivity;
};