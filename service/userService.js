const crypto = require('crypto');
const { User } = require('../models');

module.exports = {
  emailCheck: async (email) => {
    try {
      const alreadyEmail = await User.findOne({
        where: {
          email,
        }
      });
      return alreadyEmail;
    } catch (err) {
      throw err;
    }
  },
  nicknameCheck: async (nickname) => {
    try {
      const alreadyNickname = await User.findOne({
        where: {
          nickname,
        }
      });
      return alreadyNickname;
    } catch (err) {
      throw err;
    }
  },

  getNickname: async(id)=>{
    const user = await User.findOne({
      where:{id}
    });
    return user.nickname;
  },
  
  signup: async (email, password, nickname) => {
    try {
      const salt = crypto.randomBytes(64).toString('base64');
      const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');
      const user = await User.create({
        email,
        password: hashedPassword,
        nickname,
        salt,
      });
      return user;
    } catch (err) {
      throw err;
    }
  },

  signin: async (email, password, salt) => {
    try {
      const inputPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');
      const user = await User.findOne({
        where : {
          email,
          password: inputPassword
        }
      });
      return user;
    } catch (err) {
      throw err;
    }
  },

  // User 테이블에 접근하는 함수들 작성
};