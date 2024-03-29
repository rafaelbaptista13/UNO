module.exports = (sequelize, Sequelize) => {
    const SupportMaterial = sequelize.define("SupportMaterials", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        order: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
        },
        media_id: {
            type: Sequelize.STRING,
        },
        media_type: {
            type: Sequelize.STRING,
        },
        media_secret: {
            type: Sequelize.STRING,
        }
    });

    return SupportMaterial;
};