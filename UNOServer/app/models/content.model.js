module.exports = (sequelize, Sequelize) => {
    const Content = sequelize.define("Contents", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        week_number: {
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

    return Content;
};