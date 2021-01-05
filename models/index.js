const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}


db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Category = require('./category')(sequelize, Sequelize);
db.Question = require('./question')(sequelize, Sequelize);
db.Test = require('./test')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);

// category : test = 1 : N
db.Category.hasMany(db.Test);
db.Test.belongsTo(db.Category);

// user : test = 1 : N
db.User.hasMany(db.Test);
db.Test.belongsTo(db.User);

// test : question = 1 : N
db.Test.hasMany(db.Question);
db.Question.belongsTo(db.Test);


module.exports = db;
