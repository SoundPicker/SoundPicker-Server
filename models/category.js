module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Category', {
    thumbnailUrl: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: false,
    }
  }, {
    freezeTableName: true,
    timestamps: false,
  });
};