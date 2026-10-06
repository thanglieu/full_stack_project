import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { api } from '../../api/client';

export default function TestResult() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get(`/api/exam/test/result/${id}`).then((data) => {
      setResult({
        score: data.user_test.score,
        testTitle: data.user_test.test.title,
        username: data.user_test.user.username,
        questions: data.question_results.map((qr) => ({
          stt: qr.question.stt,
          text: qr.question.text,
          answers: qr.answer_list,
          userAnswer: qr.answer,
        })),
      });
    });
  }, [id]);

  if (!result) return <Layout><div className="loading">Đang tải...</div></Layout>;

  const filtered = result.questions.filter((q) => {
    if (filter === 'true') return q.userAnswer?.isCorrect;
    if (filter === 'false') return q.userAnswer && !q.userAnswer.isCorrect;
    return true;
  });

  return (
    <Layout>
      <main className="page-container">
        <h1>📊 Kết quả bài kiểm tra</h1>

        <div className="main-content" style={{ marginBottom: 24 }}>
          <p><strong>Bài kiểm tra: </strong>{result.testTitle}</p>
          <p><strong>Điểm: </strong><span style={{ fontSize: 18, fontWeight: 800, color: 'red' }}>{result.score}</span></p>
          <p><strong>Người làm: </strong>{result.username}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Chi tiết câu trả lời</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: 4, borderRadius: 5, border: '1px solid #ccc' }}>
            <option value="all">Tất cả</option>
            <option value="true">Câu đúng</option>
            <option value="false">Câu sai</option>
          </select>
        </div>

        {filtered.map((q) => (
          <div key={q.stt} className="main-content" style={{ marginBottom: 24 }}>
            <h3 style={{
              fontSize: 15, fontWeight: 800, color: '#1f3a5d',
              background: '#f1f3f5', padding: '4px 12px', borderRadius: 4, display: 'inline-block', marginBottom: 14,
            }}>
              Câu hỏi {q.stt}:
            </h3>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{q.text}</div>
            <strong style={{ display: 'block', marginTop: 14, color: '#1f3a5d', fontSize: 14.5 }}>Đáp án :</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8, marginBottom: 14 }}>
              {q.answers.map((a) => (
                <div key={a.title} style={{ background: '#fdfdfd', border: '1px dashed #ccdce3', borderRadius: 6, padding: '10px 14px', fontSize: 14.5, fontWeight: 600 }}>
                  <strong>{a.title}) </strong>
                  {a.text}
                  {a.isCorrect && ' ✅'}
                  {!a.isCorrect && q.userAnswer?.title === a.title && ' ❌'}
                </div>
              ))}
            </div>
            <strong style={{ display: 'block', marginTop: 14, color: '#1f3a5d', fontSize: 14.5 }}>Đáp án bạn chọn:</strong>
            <div style={{ background: '#fdfdfd', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 16px', marginTop: 8, fontWeight: 600 }}>
              {q.userAnswer?.title}) {q.userAnswer?.isCorrect ? '✅' : '❌'}
              {!q.userAnswer?.isCorrect && (
                <div style={{ marginTop: 6, fontSize: 14, color: 'var(--green-dark)', fontWeight: 700 }}>
                  {q.answers.find((a) => a.isCorrect)?.title}) ✅
                </div>
              )}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 12, marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
          <Link to="/exam" className="btn btn-green">Về trang chủ</Link>
        </div>
      </main>
    </Layout>
  );
}
