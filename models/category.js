module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Category', {
    thumbnailUrl: {
      type: DataTypes.STRING(512),
      allowNull: false,
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