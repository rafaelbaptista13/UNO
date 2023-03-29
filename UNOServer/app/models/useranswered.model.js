module.exports = (sequelize, Sequelize) => {
    const UserAnswered = sequelize.define("UserAnswered", {
        status_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        order: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
    });

    return UserAnswered;
};