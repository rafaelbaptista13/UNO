module.exports = (sequelize, Sequelize) => {
    const Class = sequelize.define("Classes", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });

    return Class;
};