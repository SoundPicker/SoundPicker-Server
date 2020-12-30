const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

// 라우터 작성
router.post('/signup', userController.signup);
router.post('/signin', userController.signin);
router.post('/verify/email', userController.checkEmail);
router.post('/verify/nickname', userController.checkNickname);

module.exports = router;

