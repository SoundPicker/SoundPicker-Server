const ut = require('../modules/util');
const rm = require('../modules/responseMessage');
const sc = require('../modules/statusCode');
const jwt = require('../modules/jwt');
const userService = require('../service/userService');
const { nicknameCheck } = require('../service/userService');
const { User, Test } = require('../models');
const crypto = require('crypto');
const test = require('./test');
const { NULL_VALUE } = require('../modules/responseMessage');

const user = {
  /**
   * 1. 회원가입
   * @summary 회원가입하기
   * @param email, password, nickname
   * @return 성공/실패 여부
   */
  signUp: async (req, res) => {
    const { email, password, nickname } = req.body;
    if (!email || !password || !nickname) {
      console.log('필요한 값이 없습니다!');
      return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.NULL_VALUE));
    }
    
    try {
      const alreadyEmail = await userService.emailCheck(email);
      const alreadyNickname = await userService.nicknameCheck(nickname);

        if (alreadyEmail) {
          return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.ALREADY_EMAIL));
        } else if(alreadyNickname) {
          return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm. ALREADY_NICKNAME));
        } else{
        const user = await userService.signup(email, password, nickname);
        return res.status(sc.OK).send(ut.success(sc.OK, rm.SIGN_UP_SUCCESS, {
          email: user.email,
          nickname: user.nickname
        }));
      }
    } catch (error) {
      console.error(error);
      return res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(sc.INTERNAL_SERVER_ERROR, rm.SIGN_UP_FAIL));
    }
  },

  /**
   * 2. 이메일 중복
   * @summary 이메일 중복 확인하기
   * @param email
   * @return 성공/이미 존재함/실패
   */
    checkEmail: async (req, res) => {
      const { email } = req.body;
      if(!email){
        return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.NULL_VALUE));
      }
        const alreadyEmail = await userService.emailCheck(email);
        if (alreadyEmail) {
          console.log('이미 존재하는 이메일 입니다.');
          return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.ALREADY_EMAIL));
        }
        return res.status(sc.OK).send(ut.success(sc.OK, rm.USABLE_EMAIL, {
          email: email,
          }))
      },

  /**
   * 3. 닉네임 중복
   * @summary 닉네임 중복 확인하기
   * @param nickname
   * @return 성공/이미존재함/실패
   */
    checkNickname: async (req, res) => {
      const { nickname } = req.body;
      if(!nicknameCheck){
        return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.NULL_VALUE));
      }
        const alreadyNickname = await userService.nicknameCheck(nickname);
        if (alreadyNickname) {
          console.log('이미 존재하는 닉네임 입니다.');
          return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.ALREADY_NICKNAME));
        }
        return res.status(sc.OK).send(ut.success(sc.OK, rm.USABLE_NICKNAME, {
          nickname: nickname,
        }))
      },

    /**
   * 4. 로그인
   * @summary 로그인하기
   * @param email
   * @return 성공(token, nickname)/실패
   */
  signIn: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        console.log('필요한 값이 없습니다!');
        return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.NULL_VALUE));
    }

    try {
        const alreadyEmail = await userService.emailCheck(email);
        if (!alreadyEmail) {
            console.log('없는 이메일 입니다.');
            return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.NO_EMAIL));
        }

        const { salt, password: hashedPassword } = alreadyEmail;
        const user = await userService.signin(email, password, salt);
        
        if (!user) {
            console.log('비밀번호가 일치하지 않습니다.');
            return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.MISS_MATCH_PW));
        }
        const { accessToken, refreshToken } = await jwt.sign(user);
        return res.status(sc.OK).send(ut.success(sc.OK, rm.SIGN_IN_SUCCESS, {
            accessToken,
            refreshToken,
            nickname: user.nickname,
        }));
    } catch (error) {
        console.error(error);
        return res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(sc.INTERNAL_SERVER_ERROR, rm.SIGN_IN_FAIL));
    }
  },

  /**
   * 5. 마이페이지
   * @summary 마이페이지 조회하기
   * @param token
   * @return 해당 유저의 마이페이지 조회
   */
  getMypage: async (req, res) => {
    const { id } = req.decoded; //토큰 가져오기
    console.log(req.decoded);


    try {
      UserId = Test.UserId; //Test DB에서 user 찾기 (user가 만든 테스트 유무 확인)
      const find = await Test.findOne({
        where: { UserId :id, hidden:0 },
        attributes: ['id', 'title', 'description', 'generated']
      })
      
      if(!find) { //user 없을때
        const find = await User.findOne({
          where: {
            id
          },
          attributes: ['id', 'email', 'nickname']
        });
        return res.status(sc.OK).send(ut.success(sc.OK, rm.MYPAGE_BRING_SUCCESS, find));
        } else {
          const user = await User.findOne({
            where: {
              id
            }, 
            attributes: ['id', 'email', 'nickname'],
            include: [{
              model: Test,
              require: true,
              attributes: ['id', 'title', 'description', 'generated', 'hidden'],
              where:{hidden:0}
            }],
          });
          console.log(user);
      return res.status(sc.OK).send(ut.success(sc.OK, rm.MYPAGE_BRING_SUCCESS, user));
      }
    }
      catch (error) {
        console.error(error);
        return res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(sc.INTERNAL_SERVER_ERROR, rm.MYPAGE_BRING_FAIL));
      }
    },
  
  /**
   * 6. 이메일 변경
   * @summary 해당 유저의 이메일 변경하기
   * @param token, email
   * @return 성공/권한없음/이미존재함/실패
   */
  changeEmail: async (req, res) => {
    const { id } = req.decoded;
    const { email } = req.body;
    try{
      const user = await User.findOne({
          where : { id },
      })
      
      if (!user) {
        return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.NULL_VALUE));
      }

      const alreadyEmail = await userService.emailCheck(email);
      if (alreadyEmail) {
        console.log('이미 존재하는 이메일 입니다.');
        return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.ALREADY_EMAIL));
      } 
      
      await User.update({
        email
      },
      {
        where: {
          id,
        },
      });
      const changedEmail = await User.findOne({
        where: {
          id
        },
        attributes: ['id', 'email']
      })
    return res.status(sc.OK).send(ut.success(sc.OK, rm.UPDATE_EMAIL_SUCCESS, changedEmail));
    } catch (error) {
      console.error(error);
      return res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(sc.INTERNAL_SERVER_ERROR, rm.UPDATE_EMAIL_FAIL));
    }
  },

  /**
   * 7. 닉네임 변경
   * @summary 해당 유저의 닉네임 변경하기
   * @param token, nickname
   * @return 성공/권한없음/이미존재함/실패
   */
  changeNickname: async (req, res) => {
    const { id } = req.decoded;
    const { nickname } = req.body;
    try{
      const user = await User.findOne({
          where : { id },
      })

      if (!user) {
        return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.NULL_VALUE));
      }

      const alreadyNickname = await userService.nicknameCheck(nickname);
      if (alreadyNickname) {
        console.log('이미 존재하는 닉네임 입니다.');
        return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.ALREADY_NICKNAME));
      }
      
      await User.update({
        nickname
      },
      {
        where: {
          id,
        },
      });
      
      const changedNickname = await User.findOne({
        where: {
          id
        },
        attributes: ['id', 'nickname']
      })
    return res.status(sc.OK).send(ut.success(sc.OK, rm.UPDATE_NICKNAME_SUCCESS, changedNickname));
    } catch (error) {
      console.error(error);
      return res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(sc.INTERNAL_SERVER_ERROR, rm.UPDATE_NICKNAME_FAIL));
    }
  },

  /**
   * 8. 패스워드 변경
   * @summary 해당 유저의 패스워드 변경하기
   * @param token, password
   * @return 성공/권한없음/실패
   */
  changePassword: async (req, res) => {
    const { id } = req.decoded;
    const { password } = req.body;
    try{
      const user = await User.findOne({
          where : { id },
      })
      if (!user) {
        return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.NULL_VALUE));
      }

      const salt = crypto.randomBytes(64).toString('base64');
      const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('base64');

      await User.update({
        password: hashedPassword,
        salt
      },
      {
        where: {
          id,
        },
      });
      
      await User.findOne({
        where: {
          id
        },
        attributes: ['id', 'password']
      })
    return res.status(sc.OK).send(ut.success(sc.OK, rm.UPDATE_PASSWORD_SUCCESS));
    } catch (error) {
      console.error(error);
      return res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(sc.INTERNAL_SERVER_ERROR, rm.UPDATE_PASSWORD_FAIL));
    }
  },
};

module.exports = user;