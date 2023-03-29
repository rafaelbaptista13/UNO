module.exports = (sequelize, Sequelize) => {
    const IdentifyMode = sequelize.define("IdentifyMode", {
        activity_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
    });

    return IdentifyMode;
};