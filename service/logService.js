const moment = require('moment');
const Op = require('sequelize').Op;
const {Log} = require('../models');
const sendSlackMessage = require('../modules/slack');

module.exports = {
  everydayNotify:async()=>{
    const mainAccess = await Log.count({
      where:{
        type:0,
        createdAt:{
          [Op.gt]: moment().format('YYYY-MM-DD 00:00'),
          [Op.lt]: moment().format('YYYY-MM-DD 23:59')
        }
      }
    });
    const testAccess = await Log.count({
      where:{
        type:1,
        createdAt:{
          [Op.gt]: moment().format('YYYY-MM-DD 00:00'),
          [Op.lt]: moment().format('YYYY-MM-DD 23:59')
        }
      }
    });
    const mainAccessTotal = await Log.count({
      where:{
        type:0
      }
    });
    const testAccessTotal = await Log.count({
      where:{
        type:1
      }
    });
    

    sendSlackMessage(`*** ${moment().format('YYYY-MM-DD')} 트래픽 👻 ***\n - main : ${mainAccess} (누적 ${mainAccessTotal})\n - test : ${testAccess} (누적 ${testAccessTotal})`);
  }
}