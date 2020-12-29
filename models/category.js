module.exports = (sequelize, DataTypes) => {
  return sequelize.define('category', {
    category_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
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