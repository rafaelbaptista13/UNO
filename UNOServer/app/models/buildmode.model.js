module.exports = (sequelize, Sequelize) => {
    const BuildMode = sequelize.define("BuildMode", {
        activity_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        sequence_length: {
            type: Sequelize.INTEGER,
            allowNull: false,
        }
    });

    return BuildMode;
};