module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Test', {
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    questionCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    visitCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0,
    },
    hidden:{
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue:0,
    }
  }, {
    freezeTableName: true,
    timestamps: false,
  });
};