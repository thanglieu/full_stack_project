const examModel = require('../models/exam_model');

// ========== HOME ==========
exports.examHome = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [tests, total] = await Promise.all([
      examModel.getTests(skip, limit),
      examModel.countTests(),
    ]);

    return res.json({
      tests,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      this_user_id: req.user?.id,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ========== CREATE TEST ==========
exports.createTest = async (req, res) => {
  try {
    const topics = await examModel.getAllTopics();
    let question_count = 0;
    let title = '';
    let k = 0;

    // Bước 1: GET có query (title, question_count, topics)
    if (req.query.question_count) {
      question_count = parseInt(req.query.question_count) || 0;
      title = req.query.title || '';
      k = 1;
    }

    // Bước 2: POST — lưu Test + Questions + Answers
    if (req.method === 'POST') {
      const authorId = req.user?.id;
      question_count = parseInt(req.body.question_count || req.query.question_count) || 0;
      title = req.body.title || req.query.title || '';

      const topicIds = []
        .concat(req.body.topics || req.query.topics || [])
        .filter(Boolean)
        .map(Number);

      // Tạo Test
      const test = await examModel.createTest({
        title,
        quantity: question_count,
        authorId,
        topics: {
          connect: topicIds.map((id) => ({ id })),
        },
      });

      // Lưu từng câu hỏi + 4 đáp án
      for (let i = 0; i < question_count; i++) {
        const qText = req.body[`questions-${i}-text`] || req.body[`question_${i}_text`];
        const stt = parseInt(req.body[`questions-${i}-stt`] || i + 1);

        const question = await examModel.createQuestion({
          testId: test.id,
          text: qText || '',
          stt,
        });

        for (let j = 0; j < 4; j++) {
          const letter = String.fromCharCode(97 + j); // a,b,c,d
          const aText =
            req.body[`answers-${i}-${j}-text`] ||
            req.body[`answer_${i}_${letter}_text`] ||
            '';
          const isCorrect =
            req.body[`answers-${i}-${j}-is_correct`] === 'on' ||
            req.body[`answers-${i}-${j}-is_correct`] === 'true' ||
            req.body[`correct_${i}`] === letter;

          await examModel.createAnswer({
            questionId: question.id,
            title: letter,
            text: aText,
            isCorrect: !!isCorrect,
          });
        }
      }

      return res.status(201).json({ test });
    }

    // GET: form nhập title/số câu hoặc form nhập câu hỏi
    const question_initial = Array.from({ length: question_count }, (_, i) => ({
      stt: i + 1,
    }));
    const answer_initial = ['a', 'b', 'c', 'd'].map((title) => ({ title }));

    // Tạo cặp question-answer để dựng form
    const question_answer_pairs = question_initial.map((q, idx) => ({
      question: q,
      answers: answer_initial,
      index: idx,
    }));

    return res.json({
      question_count,
      title,
      topics,
      k,
      question_answer_pairs,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ========== TAKE TEST ==========
exports.takeTest = async (req, res) => {
  try {
    const testId = Number(req.params.test_id);
    const userId = req.user?.id;

    const test = await examModel.findTestById(testId);
    if (!test) return res.status(404).json({ message: 'Không tìm thấy đề' });

    const questions = await examModel.getQuestionsByTest(testId);
    const existing_user_test = await examModel.findUserTest(userId, testId);
    let error = null;

    if (req.method === 'POST') {
      const selected_answers = {};

      for (const question of questions) {
        const selected = req.body[`question_${question.id}`];
        if (selected) selected_answers[String(question.id)] = selected;
      }

      if (Object.keys(selected_answers).length !== questions.length) {
        error = 'Vui lòng chọn đáp án cho tất cả câu hỏi.';
        return res.status(400).json({
          test,
          questions,
          existing_user_test,
          error,
        });
      }

      // Tạo / lấy UserTest, xóa đáp án cũ
      const userTest = await examModel.upsertUserTest(userId, testId);
      await examModel.deleteUserAnswers(userTest.id);

      let correct_count = 0;

      for (const question of questions) {
        const answerId = Number(selected_answers[String(question.id)]);
        const answer = await examModel.findAnswerById(answerId, question.id);
        if (!answer) continue;

        await examModel.createUserAnswer(userTest.id, answer.id);
        if (answer.isCorrect) correct_count += 1;
      }

      const score =
        questions.length > 0
          ? Math.round((correct_count / questions.length) * 10000) / 100
          : 0;

      await examModel.updateUserTestScore(userTest.id, score);

      return res.json({ userTestId: userTest.id, score });
    }

    return res.json({
      test,
      questions,
      existing_user_test,
      error,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ========== KẾT QUẢ BÀI LÀM ==========
exports.userAnswer = async (req, res) => {
  try {
    const userTestId = Number(req.params.user_test_id);
    const userId = req.user?.id;

    const user_test = await examModel.findUserTestById(userTestId, userId);
    if (!user_test) {
      return res.status(404).json({ message: 'Không tìm thấy bài làm' });
    }

    const answers = await examModel.getUserAnswers(userTestId);
    const selected_by_question = {};
    for (const ua of answers) {
      selected_by_question[ua.answer.questionId] = ua.answer;
    }

    const questions = await examModel.getQuestionsByTest(user_test.testId);
    const question_results = [];

    for (const question of questions) {
      const answer_list = question.answers || (await examModel.getAnswersByQuestion(question.id));
      question_results.push({
        question,
        answer_list,
        answer: selected_by_question[question.id] || null,
      });
    }

    return res.json({
      user_test,
      question_results,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ========== DANH SÁCH USER ĐÃ LÀM TEST ==========
exports.userTest = async (req, res) => {
  try {
    const testId = Number(req.params.test_id);
    const test = await examModel.findTestById(testId);
    if (!test) return res.status(404).json({ message: 'Không tìm thấy đề' });

    const user_tests = await examModel.getUserTestsByTest(testId);

    return res.json({
      test,
      user_tests,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
