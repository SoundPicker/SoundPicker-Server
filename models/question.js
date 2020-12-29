module.exports = (sequelize, DataTypes) => {
  return sequelize.define('question', {
    
    question_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    test_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hint: {
      type: DataTypes.String(50),
      allowNull: false,
    },
    answer: {
      type: DataTypes.String(200),
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.String(512),
      allowNull: false,
    },
    questionYoutubeURL: {
      type: DataTypes.String(512),
      allowNull: false,
    },
    questionStartsfrom: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sound1URL: {
      type: DataTypes.String(512),
      allowNull: false,
    },
    sound3URL: {
      type: DataTypes.String(512),
      allowNull: false,
    },
    answerYoutubeURL: {
      type: DataTypes.String(512),
      allowNull: false,
    },
    answerStartsfrom: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    freezeTableName: true,
    timestamps: false,
  });
};