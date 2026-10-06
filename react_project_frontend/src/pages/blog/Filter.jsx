import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { formatDate } from '../../utils/date';
import { api } from '../../api/client';

export default function Filter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [topics, setTopics] = useState([]);
  const [selected, setSelected] = useState(
    [].concat(searchParams.getAll('topics') || []).map(Number)
  );
  const [articles, setArticles] = useState([]);
  const [tab, setTab] = useState('articles');

  useEffect(() => {
    api.get(`/api/blog/filter?${searchParams.toString()}`).then((data) => {
      setTopics(data.topics || []);
      setArticles(data.articles || []);
    });
  }, [searchParams]);

  const toggleTopic = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const applyFilter = () => {
    const params = new URLSearchParams();
    selected.forEach((id) => params.append('topics', id));
    setSearchParams(params);
  };

  return (
    <Layout>
      <div className="page-container wide" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        <aside className="sidebar-box" style={{ height: 'fit-content', position: 'sticky', top: 84 }}>
          <h3>Chủ đề</h3>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {topics.map((t) => (
              <label
                key={t.id}
                style={{
                  display: 'flex', alignItems: 'center', padding: '6px 10px',
                  background: '#f8f9fa', borderRadius: 6, cursor: 'pointer', marginBottom: 6,
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(t.id)}
                  onChange={() => toggleTopic(t.id)}
                  style={{ marginRight: 8, accentColor: 'var(--green)' }}
                />
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{t.name}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            <button onClick={applyFilter} className="btn btn-green">🔍 Lọc bài</button>
            <Link to="/blog" className="btn btn-dark">← Quay lại</Link>
          </div>
        </aside>

        <main className="main-content">
          <h2 style={{ fontSize: 19, fontWeight: 800, color: '#1f3a5d', marginBottom: 20, paddingBottom: 6, borderBottom: '2px solid var(--green)', display: 'inline-block' }}>
            📚 Kết quả lọc theo chủ đề
          </h2>

          <select
            value={tab}
            onChange={(e) => setTab(e.target.value)}
            style={{ padding: 10, borderRadius: 6, border: '1px solid var(--border)', width: '100%', marginBottom: 20, cursor: 'pointer' }}
          >
            <option value="articles">Bài viết ({articles.length})</option>
            <option value="tests">Bài kiểm tra (0)</option>
            <option value="practices">Thực hành (0)</option>
          </select>

          {tab === 'articles' && (
            articles.length ? (
              articles.map((a) => (
                <div key={a.id} style={{
                  display: 'block', padding: '18px 22px', background: '#fff',
                  border: '1px solid var(--border)', borderLeft: '5px solid var(--green)',
                  borderRadius: 8, marginBottom: 14,
                }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800 }}>
                    <Link to={`/blog/articles/${a.id}`} style={{ textDecoration: 'none', color: '#1f3a5d' }}>
                      {a.title}
                    </Link>
                  </h3>
                  <div style={{ color: 'var(--muted)', fontSize: 13.5, fontWeight: 600 }}>
                    <span style={{ marginRight: 16 }}>✍️ <strong>{a.author.name}</strong></span>
                    <span style={{ marginRight: 16 }}>📅 {formatDate(a.createdAt)}</span>
                    <span>❤️ {a.like || 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state"><p>😔 Không tìm thấy bài viết nào.</p></div>
            )
          )}
          {tab !== 'articles' && <div className="empty-state"><p>😔 Không tìm thấy kết quả.</p></div>}
        </main>
      </div>
    </Layout>
  );
}
