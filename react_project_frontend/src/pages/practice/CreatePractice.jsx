import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export default function CreatePractice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/practice/create').then((data) => setTopics(data.topics || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/practice/create', {
        submit: 'confirm',
        title,
        content,
        code,
        language_type: language,
        topic: selectedTopics,
      });
      navigate('/practice');
    } catch (err) {
      setError(err.message || 'Tạo practice thất bại');
    }
  };

  return (
    <Layout>
      <div className="page-container" style={{ maxWidth: 800 }}>
        <Link to="/practice" style={{ color: 'var(--muted)', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
          ← Quay lại
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 28, paddingBottom: 16, borderBottom: '3px solid var(--green)' }}>
          <h1>Tạo Practice mới</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-card" style={{ marginBottom: 24 }}>
            <div style={{ background: '#f0f0f0', padding: '12px 20px', fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid var(--border)' }}>
              Thông tin Practice
            </div>
            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label style={{ color: 'var(--muted)' }}>Tác giả</label>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--gray-bg)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 700, width: 'fit-content',
                }}>
                  <span style={{ width: 7, height: 7, background: 'var(--green)', borderRadius: '50%' }} />
                  {user?.username || 'guest'}
                </div>
              </div>
              <div className="form-group">
                <label>Tiêu đề</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Nội dung</label>
                <textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Chủ đề</label>
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
              <div className="form-group">
                <label>Ngôn ngữ</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c++">C++</option>
                </select>
              </div>
              <div className="form-group">
                <label>Code</label>
                <textarea
                  rows={12}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  style={{ fontFamily: "'Source Code Pro', monospace", fontSize: 13 }}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-green" style={{ padding: '10px 28px' }}>
            Tạo Practice
          </button>
        </form>
      </div>
    </Layout>
  );
}
