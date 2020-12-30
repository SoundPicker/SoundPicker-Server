const ut = require('../modules/util');
const rm = require('../modules/responseMessage');
const sc = require('../modules/statusCode');
const jwt = require('../modules/jwt');
const crypto = require('crypto');
const { User } = require('../models');


module.exports = {
  get: async (req, res) => {
      try {
          const randToken = await crypto.randomBytes(4).toString('hex');
          const user = await User.create({nickname: randToken});
          const {token} = await jwt.sign(user);
          res.status(sc.OK).send(ut.success(sc.OK, rm.SUCCESS_ISSUE_TOKEN, {token}));
      } catch (error) {
          console.log('get rand token error : ', error)
          res.status(sc.SERVICE_UNAVAILABLE).send(ut.fail(sc.SERVICE_UNAVAILABLE));
      }
  },
  delByToken: async function (req, res) {
      try {
          const id = req.query.id;
          if (!id) {
              const user = req.decoded;
              id = user.id;
          }
          const result = await User.destroy({where: {id}});
          if (result > 0)
              res.status(sc.OK).send(ut.success(sc.OK, rm.DELETE_ISSUE_TOKEN));
          else 
              res.status(sc.OK).send(ut.success(sc.BAD_REQUEST, rm.EMPTY_RAND_TOKEN));
          
      } catch (error) {
          console.log('get rand token error : ', error)
          res.status(sc.SERVICE_UNAVAILABLE).send(ut.fail(sc.SERVICE_UNAVAILABLE));
      }
  },
  checkRandToken: (req, res) => {
      const user = req.descd;
      res.status(sc.OK).send(ut.success(sc.OK, rm.SUCCESS_ISSUE_TOKEN, {id: user.id, nickname: user.nickname}));

  }
}
