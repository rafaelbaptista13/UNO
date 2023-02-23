module.exports = (sequelize, Sequelize) => {
    const Activity = sequelize.define("Activities", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        type: {
            type: Sequelize.STRING(30),
            allowNull: false
        },
        order: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        title: {
            type: Sequelize.STRING(70),
            allowNull: false
        },
    });

    return Activity;
};