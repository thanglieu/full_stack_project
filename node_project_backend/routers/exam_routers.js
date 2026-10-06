const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam_controller');
const { loginRequired } = require('../middlewares/auth');

router.get('/', loginRequired, examController.examHome);
router.get('/create', loginRequired, examController.createTest);
router.post('/create', loginRequired, examController.createTest);

router.get('/take/:test_id', loginRequired, examController.takeTest);
router.post('/take/:test_id', loginRequired, examController.takeTest);

router.get('/test/:test_id', loginRequired, examController.userTest);
router.get('/test/result/:user_test_id', loginRequired, examController.userAnswer);

module.exports = router;