import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { api } from '../../api/client';

export default function TakePractice() {
  const { id } = useParams();
  const [practice, setPractice] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [tab, setTab] = useState('description');
  const [submitted, setSubmitted] = useState(false);
  const [mark, setMark] = useState(0);
  const [userOutputs, setUserOutputs] = useState([]);

  useEffect(() => {
    api.get(`/api/practice/${id}/take`).then((data) => {
      setPractice(data.practice);
      setCode(data.user_code || '');
      setLanguage(data.language || 'python');
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await api.post(`/api/practice/${id}/take`, {
      user_code: code,
      language_type: language,
    });
    setMark(data.mark);
    setUserOutputs(data.user_outputs || []);
    setSubmitted(true);
    setTab('testcase');
  };

  if (!practice) return <Layout><div className="loading">Đang tải...</div></Layout>;

  return (
    <Layout>
      <div style={{
        display: 'flex', padding: 12, gap: 12, height: 'calc(100vh - 52px - 60px)',
      }}>
        {/* Left panel */}
        <div style={{
          flex: 5, background: '#fff', borderRadius: 8, border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{
            background: '#fdfdfd', borderBottom: '1px solid var(--border)',
            padding: '0 12px', height: 40, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {['description', 'testcase', 'answer'].map((t) => (
              <div
                key={t}
                onClick={() => setTab(t)}
                style={{
                  fontSize: 13.5, fontWeight: tab === t ? 700 : 600,
                  color: tab === t ? 'var(--dark)' : 'var(--muted)',
                  padding: '8px 12px', cursor: 'pointer',
                  borderBottom: tab === t ? '2px solid var(--dark)' : '2px solid transparent',
                }}
              >
                {t === 'description' ? 'Description' : t === 'testcase' ? 'Testcase' : 'Answer'}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {tab === 'description' && (
              <>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 15 }}>{practice.title}</h1>
                <div style={{ fontSize: 14, marginBottom: 10, borderBottom: '1px solid #eaecef', paddingBottom: 10 }}>
                  <strong>Tác giả:</strong>{' '}
                  <Link to={`/blog/users/${practice.author.id}`}>{practice.author.username}</Link>
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.6 }}>
                  <strong>Mô tả:</strong>
                  <div style={{ whiteSpace: 'pre-line' }}>{practice.content}</div>
                </div>
              </>
            )}
            {tab === 'testcase' && (
              submitted ? (
                <>
                  <p style={{ fontWeight: 700, marginBottom: 12 }}>Điểm: {mark} / {userOutputs.length}</p>
                  {userOutputs.map((o, i) => (
                    <div key={i} style={{
                      background: o.is_correct ? 'var(--green-light)' : '#ffebee',
                      border: `1px solid ${o.is_correct ? 'var(--green)' : '#ef9a9a'}`,
                      borderRadius: 6, padding: 12, marginBottom: 10, fontSize: 13.5,
                    }}>
                      <div><strong>Input:</strong> {o.input}</div>
                      <div><strong>Kỳ vọng:</strong> {o.expected}</div>
                      <div><strong>Kết quả:</strong> {o.user_output} {o.is_correct ? '✅' : '❌'}</div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>
                  <p>Chưa có code. Hãy submit để xem kết quả.</p>
                </div>
              )
            )}
            {tab === 'answer' && (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>
                <p>Lời giải chính thức.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Code editor */}
        <div style={{ flex: 7, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              flex: 1, background: '#fff', borderRadius: 8, border: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}>
              <div style={{
                background: '#fdfdfd', borderBottom: '1px solid var(--border)',
                padding: '0 12px', height: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <strong>Code</strong>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c++">C++</option>
                </select>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Viết code của bạn ở đây..."
                style={{
                  flex: 1, border: 'none', padding: 16,
                  fontFamily: "'Source Code Pro', monospace", fontSize: 14,
                  resize: 'none', outline: 'none',
                  background: '#1e1e1e', color: '#f4f4f4',
                  caretColor: 'var(--green)',
                }}
              />
            </div>
            <button type="submit" className="btn btn-green" style={{ alignSelf: 'flex-end', width: 100 }}>
              Submit
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
