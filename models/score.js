module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Score', {
    room: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    content: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    freezeTableName: true,
    timestamps: false,
  });
};