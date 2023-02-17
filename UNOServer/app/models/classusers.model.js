module.exports = (sequelize, Sequelize) => {
    const ClassUsers = sequelize.define("ClassUsers", {
        user_type: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    });

    return ClassUsers;
};