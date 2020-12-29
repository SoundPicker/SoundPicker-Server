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
    },
    hidden:{
      type: DataTypes.TINYINT(1),
      default:0
    }
  }, {
    freezeTableName: true,
    timestamps: false,
  });
};