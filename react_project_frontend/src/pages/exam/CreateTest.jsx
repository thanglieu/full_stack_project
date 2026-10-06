import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { api } from '../../api/client';

export default function CreateTest() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [questionCount, setQuestionCount] = useState(2);
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);

  useEffect(() => {
    api.get('/api/exam/create').then((data) => setTopics(data.topics || []));
  }, []);

  const initQuestions = (e) => {
    e.preventDefault();
    const qs = Array.from({ length: questionCount }, (_, i) => ({
      stt: i + 1,
      text: '',
      answers: ['a', 'b', 'c', 'd'].map((t) => ({ title: t, text: '', isCorrect: false })),
    }));
    setQuestions(qs);
    setStep(1);
  };

  const updateQuestion = (qi, field, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qi] = { ...next[qi], [field]: value };
      return next;
    });
  };

  const updateAnswer = (qi, ai, field, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      const answers = [...next[qi].answers];
      answers[ai] = { ...answers[ai], [field]: value };
      next[qi] = { ...next[qi], answers };
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      title,
      question_count: questions.length,
      topics: selectedTopics,
    };
    questions.forEach((q, i) => {
      body[`questions-${i}-text`] = q.text;
      body[`questions-${i}-stt`] = q.stt;
      q.answers.forEach((a, j) => {
        body[`answers-${i}-${j}-text`] = a.text;
        body[`answers-${i}-${j}-is_correct`] = a.isCorrect ? 'true' : 'false';
      });
    });
    await api.post('/api/exam/create', body);
    navigate('/exam');
  };

  return (
    <Layout>
      <main className="page-container">
        <h1>Nhập nội dung chi tiết bài kiểm tra</h1>

        {step === 0 && (
          <form onSubmit={initQuestions} className="main-content" style={{ background: 'var(--green-light)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--green-dark)', marginBottom: 20 }}>
              Thông tin bài Test
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="form-group">
                <label>Tiêu đề bài kiểm tra</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Số lượng câu hỏi</label>
                <input type="number" min={1} value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Chủ đề (giữ Ctrl để chọn nhiều)</label>
                <select
                  multiple
                  value={selectedTopics.map(String)}
                  onChange={(e) => setSelectedTopics(Array.from(e.target.selectedOptions).map((o) => Number(o.value)))}
                  style={{ minHeight: 100 }}
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: 20 }}>
              <button type="submit" className="btn btn-green">Khởi tạo câu hỏi</button>
            </div>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={handleSubmit}>
            {questions.map((q, qi) => (
              <fieldset key={qi} style={{
                border: '1px solid var(--border)', borderRadius: 8, padding: 24, marginBottom: 28, background: '#fff',
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1f3a5d', marginBottom: 16, background: '#f1f3f5', padding: '4px 12px', borderRadius: 4, display: 'inline-block' }}>
                  Câu hỏi {q.stt}
                </h3>
                <div className="form-group">
                  <label>Nội dung câu hỏi :</label>
                  <textarea
                    rows={3}
                    value={q.text}
                    onChange={(e) => updateQuestion(qi, 'text', e.target.value)}
                    required
                  />
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginTop: 20, marginBottom: 12, borderLeft: '3px solid var(--green)', paddingLeft: 8 }}>
                  Các đáp án lựa chọn
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {q.answers.map((a, ai) => (
                    <div key={ai} style={{ background: '#fdfdfd', border: '1px dashed #ccdce3', borderRadius: 8, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontWeight: 800, fontSize: 14.5, color: '#1f3a5d' }}>Lựa chọn {a.title})</span>
                        <label style={{ fontSize: 13.5, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={a.isCorrect}
                            onChange={(e) => updateAnswer(qi, ai, 'isCorrect', e.target.checked)}
                          />{' '}
                          Đáp án đúng
                        </label>
                      </div>
                      <textarea
                        rows={2}
                        value={a.text}
                        onChange={(e) => updateAnswer(qi, ai, 'text', e.target.value)}
                        style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 6 }}
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
            ))}
            <div style={{ display: 'flex', gap: 16, marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <button type="submit" className="btn btn-green">Tạo bài kiểm tra</button>
              <Link to="/exam" className="btn btn-secondary">Về trang chủ</Link>
            </div>
          </form>
        )}
      </main>
    </Layout>
  );
}
