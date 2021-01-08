const express = require('express');
const router = express.Router();

const testController = require('../controllers/test');
const authUtil = require('../middlewares/auth');

// 라우터 작성
router.get('/recommendation', testController.getTestRecommendations);
router.get('/', testController.getTests);
router.post('/', authUtil.checkToken, testController.createTest);


router.get('/:TestId', testController.getSpecificTest);
router.put('/:TestId', authUtil.checkToken, testController.updateTest);
router.delete('/:TestId', authUtil.checkToken, testController.hideTest);


router.get('/:TestId/updatepage', testController.getSpecificTestBeforeUpdate);
router.get('/:TestId/recommendation', testController.finishTest, testController.getTestRecommendations);


module.exports = router;

