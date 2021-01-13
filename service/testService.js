const {Test, User} = require('../models');

module.exports = {
  getTests: async()=>{
    const where = {hidden:0, generated:1};
    const order = [['visitCount', 'desc']];
    const attributes = ['id', 'title', 'description', 'questionCount'];
    const include = [{model:User, attributes:['nickname']}, {model:Category, attributes:['id']}];

    const result = await Test.findAll({include, attributes, where, order});
    return result;
  },

  getCategoryTests: async(CategoryId)=>{
    const where = {hidden:0, generated:1, CategoryId};
    const order = [['visitCount', 'desc']];
    const attributes = ['id', 'title', 'description', 'questionCount'];
    const include = [{model:User, attributes:['nickname']}, {model:Category, attributes:['id']}];

    const result = await Test.findAll({include, attributes, where, order});
    return result;
  },

  // Test 테이블에 접근하는 함수들 작성
}