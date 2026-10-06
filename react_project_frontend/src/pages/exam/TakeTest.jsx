import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { api } from '../../api/client';

export default function TakeTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/exam/take/${id}`).then((data) => {
      setTest(data.test);
      setQuestions(data.questions || []);
    });
  }, [id]);

  const handleSelect = (qId, aId) => {
    setAnswers((prev) => ({ ...prev, [qId]: aId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (Object.keys(answers).length !== questions.length) {
      setError('Vui lòng chọn đáp án cho tất cả câu hỏi.');
      return;
    }
    const body = {};
    questions.forEach((q) => { body[`question_${q.id}`] = answers[q.id]; });

    try {
      const data = await api.post(`/api/exam/take/${id}`, body);
      navigate(`/exam/test/result/${data.userTestId}`);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  if (!test) return <Layout><div className="loading">Đang tải...</div></Layout>;

  return (
    <Layout>
      <main className="page-container">
        <h1>Làm bài kiểm tra: {test.title}</h1>

        <div className="main-content" style={{ marginBottom: 24 }}>
          <p><strong>Người tạo: </strong>{test.author.username}</p>
          <p><strong>Số câu hỏi: </strong>{test.quantity}</p>
          {error && (
            <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', color: '#c62828', padding: '10px 14px', borderRadius: 6, fontWeight: 700, marginTop: 10 }}>
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {questions.map((q, idx) => (
            <fieldset key={q.id} style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
              padding: 24, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}>
              <legend style={{
                fontSize: 15, fontWeight: 800, color: '#1f3a5d',
                background: '#f1f3f5', padding: '4px 12px', borderRadius: 4,
              }}>
                Câu hỏi {idx + 1}
              </legend>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{q.text}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {q.answers.map((a) => (
                  <label
                    key={a.id}
                    style={{
                      background: answers[q.id] === a.id ? 'var(--green-light)' : '#fdfdfd',
                      border: `1px dashed ${answers[q.id] === a.id ? 'var(--green)' : '#ccdce3'}`,
                      borderRadius: 8, padding: '14px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}
                  >
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      checked={answers[q.id] === a.id}
                      onChange={() => handleSelect(q.id, a.id)}
                      style={{ marginTop: 5, accentColor: 'var(--green)' }}
                    />
                    <span style={{ fontWeight: 800, color: '#1f3a5d' }}>{a.title})</span>
                    <span>{a.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <div style={{ display: 'flex', gap: 16, marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
            <button type="submit" className="btn btn-green">Nộp bài</button>
            <Link to="/exam" className="btn btn-secondary">Quay lại tìm kiếm</Link>
          </div>
        </form>
      </main>
    </Layout>
  );
}
