const ut = require('../modules/util');
const rm = require('../modules/responseMessage');
const sc = require('../modules/statusCode');

const {Test, Category, User, Log} = require('../models');

const main = {
  getTestsAndCategories: async(req,res) => {
    try{
      let where = {hidden:0, generated:1};
      let order = [['visitCount', 'desc']];
      let attributes = ['id', 'title', 'description', 'questionCount'];
      let include = [{model:User, attributes:['nickname']}, {model:Category, attributes:['id', 'description']}];
      const tests = await Test.findAll({include, attributes, where, order});
      const categories = await Category.findAll({});

      await Log.create({type:0});

      return res.status(sc.OK)
        .send(ut.success(sc.OK, rm.SUCCESS, {tests,categories}));
    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.success(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
    }
    
  }
};

module.exports = main;