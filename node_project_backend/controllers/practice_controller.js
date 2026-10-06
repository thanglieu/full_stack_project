const practiceModel = require('../models/practice_model');
const { runCode } = require('../utils/runCode');

// GET /practice
exports.practiceList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [practices, total] = await Promise.all([
      practiceModel.getPractices(skip, limit),
      practiceModel.countPractices(),
    ]);

    res.json({
      practices,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET/POST /practice/run-code
exports.runPractice = async (req, res) => {
  let output = '', error = '', input = '', code = '';
  if (req.method === 'POST') {
    input = req.body.input || '';
    code = req.body.code || '';
    const lang = req.body.language_type || 'python';
    const result = await runCode(lang, code, [input]);
    output = result.output;
    error = result.error;
  }
  res.json({ input, output, error, code });
};

// GET/POST /practice/create
exports.createPractice = async (req, res) => {
  try {
    const question_count = 5;
    const topics = await practiceModel.getAllTopics();
    let k = 0;
    let language = '';
    let formData = { title: '', content: '', code: '' };
    let testcases = Array.from({ length: question_count }, (_, i) => ({
      stt: i + 1,
      input: '',
      output: '',
    }));

    if (req.method === 'POST') {
      language = req.body.language_type || 'python';
      formData = {
        title: req.body.title || '',
        content: req.body.content || '',
        code: req.body.code || '',
      };

      // Bước 1: chạy thử → hiện output
      if (req.body.submit === 'create') {
        k = 1;
        for (let i = 0; i < question_count; i++) {
          const inp = req.body[`tc-${i}-input`] || '';
          testcases[i].input = inp;
          testcases[i].stt = i + 1;
          const { output } = await runCode(language, formData.code, [inp]);
          testcases[i].output = output;
        }
      }

      // Bước 2: xác nhận lưu DB
      if (req.body.submit === 'confirm') {
        const authorId = req.user?.id;
        const topicIds = [].concat(req.body.topic || []).filter(Boolean).map(Number);

        const practice = await practiceModel.createPractice({
          title: formData.title,
          content: formData.content,
          code: formData.code,
          authorId,
          topics: { connect: topicIds.map((id) => ({ id })) },
        });

        for (let i = 0; i < question_count; i++) {
          const inp = req.body[`tc-${i}-input`] || '';
          let out = req.body[`tc-${i}-output`] || '';
          if (!out) {
            const r = await runCode(language, formData.code, [inp]);
            out = r.output;
          }
          await practiceModel.createTestCase({
            practiceId: practice.id,
            stt: i + 1,
            input: inp,
            output: out,
          });
        }

        return res.status(201).json({ practice });
      }
    }

    res.json({
      k,
      language,
      formData,
      testcases,
      topics,
      question_count,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET/POST /practice/:practice_id/take
exports.takePractice = async (req, res) => {
  try {
    const practiceId = Number(req.params.practice_id);
    const userId = req.user?.id;

    const practice = await practiceModel.findPracticeById(practiceId);
    if (!practice) return res.status(404).json({ message: 'Không tìm thấy' });

    const testcases = practice.testCases || (await practiceModel.getTestCases(practiceId));
    let mark = 0;
    let user_outputs = [];
    let user_code = '';
    let language = 'python';
    let k = 0;

    if (req.method === 'GET') {
      const up = await practiceModel.findUserPractice(userId, practiceId);
      if (up) {
        user_code = up.userCode;
        language = up.language || 'python';
      }
    }

    if (req.method === 'POST') {
      k = 1;
      user_code = req.body.user_code || '';
      language = req.body.language_type || 'python';
    }

    if (user_code) {
      for (const tc of testcases) {
        const { output: my_out } = await runCode(language, user_code, [tc.input]);
        const is_correct = my_out.trim() === (tc.output || '').trim();
        if (is_correct) mark += 1;
        user_outputs.push({
          input: tc.input,
          expected: tc.output,
          user_output: my_out,
          is_correct,
        });
      }
    }

    if (req.method === 'POST') {
      await practiceModel.upsertUserPractice(userId, practiceId, {
        mark,
        userCode: user_code,
        language,
      });
    }

    res.json({
      k,
      user_code,
      practice,
      user_outputs,
      mark,
      language,
      m: 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /practice/:practice_id
exports.userPracticeList = async (req, res) => {
  try {
    const practiceId = Number(req.params.practice_id);
    const practice = await practiceModel.findPracticeById(practiceId);
    if (!practice) return res.status(404).json({ message: 'Không tìm thấy' });

    const user_practices = await practiceModel.getUserPracticesByPractice(practiceId);
    res.json({ practice, user_practices });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /practice/user_practice/:practice_id/:user_id
exports.userPractice = async (req, res) => {
  try {
    const practiceId = Number(req.params.practice_id);
    const targetUserId = Number(req.params.user_id);

    const practice = await practiceModel.findPracticeById(practiceId);
    if (!practice) return res.status(404).json({ message: 'Không tìm thấy' });

    const up = await practiceModel.findUserPracticeByUser(practiceId, targetUserId);
    const testcases = practice.testCases || [];

    let mark = 0;
    let user_outputs = [];
    let user_code = up?.userCode || '';
    let language = up?.language || 'python';

    if (user_code) {
      for (const tc of testcases) {
        const { output: my_out } = await runCode(language, user_code, [tc.input]);
        const is_correct = my_out.trim() === (tc.output || '').trim();
        if (is_correct) mark += 1;
        user_outputs.push({
          input: tc.input,
          expected: tc.output,
          user_output: my_out,
          is_correct,
        });
      }
    }

    res.json({
      user_code,
      practice,
      user_outputs,
      mark,
      language,
      m: 1, // xem code người khác
      k: 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
