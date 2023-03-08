module.exports = (sequelize, Sequelize) => {
    const Activity = sequelize.define("Activities", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        order: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        title: {
            type: Sequelize.STRING(70),
            allowNull: false
        },
        description: {
            type: Sequelize.STRING(200),
        }
    });

    return Activity;
};