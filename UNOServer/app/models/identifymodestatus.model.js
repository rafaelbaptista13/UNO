module.exports = (sequelize, Sequelize) => {
    const IdentifyModeStatus = sequelize.define("IdentifyModeStatus", {
        activity_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    });

    return IdentifyModeStatus;
};