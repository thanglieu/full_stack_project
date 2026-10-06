import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export default function CreateArticle() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = isEdit ? `/api/blog/articles/${id}/edit` : '/api/blog/articles/new';
    api.get(path)
      .then((data) => {
        setTopics(data.topics || []);
        if (isEdit && data.article) {
          setTitle(data.article.title);
          setContent(data.article.content);
          setSelectedTopics(data.selectedTopics || []);
        }
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleTopicChange = (e) => {
    const opts = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
    setSelectedTopics(opts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title, content, topic: selectedTopics };
    if (isEdit) {
      await api.post(`/api/blog/articles/${id}/edit`, payload);
      navigate(`/blog/articles/${id}`);
    } else {
      const data = await api.post('/api/blog/articles/new', payload);
      navigate(`/blog/articles/${data.article.id}`);
    }
  };

  if (loading) return <Layout><div className="loading">Đang tải...</div></Layout>;

  return (
    <Layout>
      <div className="page-container narrow">
        <div className="form-card">
          <h1 style={{ textAlign: 'center', marginBottom: 24 }}>
            {isEdit ? '✏️ Chỉnh sửa bài viết' : '✏️ Tạo bài viết mới'}
          </h1>
          <div className="info-box">
            💡 Chia sẻ suy nghĩ, ý tưởng hoặc kinh nghiệm của bạn với cộng đồng.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tiêu đề bài viết</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Nội dung</label>
              <textarea rows={12} value={content} onChange={(e) => setContent(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Chủ đề (giữ Ctrl để chọn nhiều)</label>
              <select multiple value={selectedTopics.map(String)} onChange={handleTopicChange} style={{ minHeight: 120 }}>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tác giả</label>
              <input type="text" value={`👤 ${user?.name || ''}`} readOnly />
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn btn-dark">
                🚀 {isEdit ? 'Cập nhật' : 'Đăng bài viết'}
              </button>
              <Link to="/blog" className="btn btn-secondary">← Quay lại</Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
