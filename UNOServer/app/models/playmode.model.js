module.exports = (sequelize, Sequelize) => {
    const PlayMode = sequelize.define("PlayMode", {
        activity_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
    });

    return PlayMode;
};