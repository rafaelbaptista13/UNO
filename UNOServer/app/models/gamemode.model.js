module.exports = (sequelize, Sequelize) => {
    const GameMode = sequelize.define("GameModes", {
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

    return GameMode;
};