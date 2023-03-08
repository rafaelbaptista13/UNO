module.exports = (sequelize, Sequelize) => {
    const ActivityType = sequelize.define("ActivityTypes", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING(10),
            allowNull: false
        },
    });

    return ActivityType;
};