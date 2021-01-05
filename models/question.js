module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Question', {
    hint: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    answer: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    questionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    questionYoutubeURL: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
    questionStartsfrom: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sound1URL: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
    sound3URL: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
    answerYoutubeURL: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
  }, {
    freezeTableName: true,
    timestamps: false,
  });
};