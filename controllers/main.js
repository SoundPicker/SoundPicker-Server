const ut = require('../modules/util');
const rm = require('../modules/responseMessage');
const sc = require('../modules/statusCode');

const {Test, Category, User} = require('../models');

const main = {
  getTestsAndCategories: async(req,res) => {
    let where = {hidden:0, generated:1};
    let order = [['visitCount', 'desc']];
    let attributes = ['id', 'title', 'description', 'questionCount'];
    let include = [{model:User, attributes:['nickname']}, {model:Category, attributes:['id', 'description']}];
    const tests = await Test.findAll({include, attributes, where, order});
    const categories = await Category.findAll({});
    return res.status(sc.OK)
      .send(ut.success(sc.OK, rm.SUCCESS, {tests,categories}));
  }
};

module.exports = main;