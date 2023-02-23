module.exports = (sequelize, Sequelize) => {
    const ActivityGroup = sequelize.define("ActivityGroups", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        order: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        number_of_videos: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        number_of_exercises: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });

    return ActivityGroup;
};