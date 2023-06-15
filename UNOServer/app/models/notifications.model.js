module.exports = (sequelize, Sequelize) => {
    const Notifications = sequelize.define("Notifications", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        type: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        message: {
            type: Sequelize.STRING,
            allowNull: false
        },
        activity_type: {
            type: Sequelize.STRING,
        },
        activity_id: {
            type: Sequelize.INTEGER
        },
        activity_order: {
            type: Sequelize.INTEGER
        },
        activity_title: {
            type: Sequelize.STRING
        },
        activity_description: {
            type: Sequelize.STRING
        },
        activitygroup_name: {
            type: Sequelize.STRING
        }
    });

    return Notifications;
};