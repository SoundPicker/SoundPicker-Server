const express = require('express');
const router = express.Router();

const testController = require('../controllers/test');
const authUtil = require('../middlewares/auth');

// 라우터 작성
router.get('/', testController.getTests);
router.get('/:TestId', testController.getSpecificTest);
router.post('/', authUtil.checkToken, testController.createTest);
router.put('/:TestId', authUtil.checkToken, testController.updateTest);
router.delete('/:TestId', authUtil.checkToken, testController.hideTest);
router.get('/recommendation', testController.getTestRecommendations);


module.exports = router;

