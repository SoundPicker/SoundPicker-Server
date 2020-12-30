const ut = require('../modules/util');
const rm = require('../modules/responseMessage');
const sc = require('../modules/statusCode');
const jwt = require('../modules/jwt');
const userService = require('../service/userService');
const { nicknameCheck } = require('../service/userService');

const user = {
  //1. 회원가입
  signup: async (req, res) => {
    const { email, password, nickname } = req.body;
    if (!email || !password || !nickname) {
      console.log('필요한 값이 없습니다!');
      return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.NULL_VALUE));
    }
    try {
      const alreadyEmail = await userService.emailCheck(email);
      const alreadyNickname = await userService.nicknameCheck(nickname);
      //중복확인버튼을 직접 눌러서 확인하지 않는경우 중복확인하라고 어떻게하지..
        if (alreadyEmail) {
          return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm.ALREADY_EMAIL));
        } else if(alreadyNickname) {
          return res.status(sc.BAD_REQUEST).send(ut.fail(sc.BAD_REQUEST, rm. ALREADY_NICKNAME));
        } else{
        //중복검사 했을때 회원가입 진행
        const user = await userService.signup(email, password, nickname);
        return res.status(sc.OK).send(ut.success(sc.OK, rm.SIGN_UP_SUCCESS, {
          email: user.email,
          password: user.password,
          nickname: user.nickname,
        }))
      }
    } catch (error) {
      console.error(error);
      return res.status(sc.INTERNAL_SERVER_ERROR).send(ut.fail(sc.INTERNAL_SERVER_ERROR, rm.SIGN_UP_FAIL));
    }
  },

    //2. 이메일 중복확인
    checkEmail: async (req, res) => {
      //<세미나 자료>>
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
          email: user.email,
        }))
      },

    //3. 닉네임 중복확인
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
          nickname: user.nickname,
        }))
      },

  //4. 로그인
  signin: async (req, res) => {
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

  //5. 로그아웃
};

module.exports = user;