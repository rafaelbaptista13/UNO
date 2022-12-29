module.exports = (sequelize, Sequelize) => {
    const Content = sequelize.define("Contents", {
        week_number: {
            type: Sequelize.INTEGER
        },
        number_of_videos: {
            type: Sequelize.INTEGER
        },
        number_of_exercises: {
            type: Sequelize.INTEGER
        }
    });

    return Content;
};