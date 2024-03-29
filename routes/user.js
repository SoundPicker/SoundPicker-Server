const express = require('express');
const router = express.Router();

const {userController} = require('../controllers');
const authUtil = require('../middlewares/auth');

// 라우터 작성
router.post('/signup', userController.signUp);
router.post('/signin', userController.signIn);

router.post('/verify/email', userController.checkEmail);
router.post('/verify/nickname', userController.checkNickname);

router.get('/mypage', authUtil.checkToken, userController.getMypage);

router.put('/email', authUtil.checkToken, userController.changeEmail);
router.put('/nickname', authUtil.checkToken, userController.changeNickname);
router.put('/password', authUtil.checkToken, userController.changePassword);

module.exports = router;

