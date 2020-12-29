module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  }, {
    freezeTableName: true,
    timestamps: false,
  });
};