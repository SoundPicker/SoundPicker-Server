module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Log', {
    type: {
      type: DataTypes.TINYINT(1), // 0 for main & 1 for specific test
      allowNull: false,
    },
  }, {
    freezeTableName: true,
    timestamps: true,
  });
};