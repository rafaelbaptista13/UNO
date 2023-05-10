module.exports = (sequelize, Sequelize) => {
    const Trophie = sequelize.define("Trophies", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
    });

    return Trophie;
};