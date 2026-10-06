const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practice_controller');
const { loginRequired } = require('../middlewares/auth');

router.get('/', loginRequired, practiceController.practiceList);
router.get('/run-code', loginRequired, practiceController.runPractice);
router.post('/run-code', loginRequired, practiceController.runPractice);

router.get('/create', loginRequired, practiceController.createPractice);
router.post('/create', loginRequired, practiceController.createPractice);

router.get('/:practice_id', loginRequired, practiceController.userPracticeList);
router.get('/:practice_id/take', loginRequired, practiceController.takePractice);
router.post('/:practice_id/take', loginRequired, practiceController.takePractice);

router.get(
  '/user_practice/:practice_id/:user_id',
  loginRequired,
  practiceController.userPractice
);

module.exports = router;