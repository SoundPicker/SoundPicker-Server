const express = require('express');
const router = express.Router();

const {mainController} = require('../controllers');

// 라우터 작성
router.get('/', mainController.getTestsAndCategories);

module.exports = router;