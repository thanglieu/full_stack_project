import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { formatDate } from '../../utils/date';
import { api } from '../../api/client';

export default function Search() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const [kw, setKw] = useState(keyword);
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('articles');

  useEffect(() => {
    if (!keyword) { setArticles([]); setUsers([]); return; }
    api.get(`/api/blog/search?keyword=${encodeURIComponent(keyword)}`).then((data) => {
      setArticles(data.articles || []);
      setUsers(data.users || []);
    });
  }, [keyword]);

  return (
    <Layout>
      <h1>🔍 Kết quả tìm kiếm</h1>
      <div className="page-container">
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1f3a5d', marginBottom: 8, paddingBottom: 6, borderBottom: '2px solid var(--green)', display: 'inline-block' }}>
          🔍 Từ khóa :
        </h2>
        <form
          className="search-form"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = `/blog/search?keyword=${encodeURIComponent(kw)}&form=search`;
          }}
        >
          <input type="text" value={kw} onChange={(e) => setKw(e.target.value)} />
          <button type="submit" className="btn btn-green">Tìm kiếm</button>
        </form>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1f3a5d', margin: '15px 0 10px', paddingBottom: 6, borderBottom: '2px solid var(--green)', display: 'inline-block' }}>
          ✍️ Người dùng ({users.length})
        </h2>
        <div className="main-content" style={{ marginBottom: 20 }}>
          {users.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
              {users.map((u) => (
                <div key={u.id} style={{
                  background: 'var(--gray-bg)', padding: 14, textAlign: 'center',
                  borderRadius: 6, border: '1px solid var(--border)',
                }}>
                  <Link to={`/blog/users/${u.id}`} style={{ fontWeight: 700, fontSize: 14, display: 'block' }}>
                    {u.name}
                  </Link>
                  <small style={{ color: 'var(--muted)', fontWeight: 600 }}>{u.mark} ⭐</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><p>😔 Không tìm thấy người dùng nào.</p></div>
          )}
        </div>

        <select
          value={tab}
          onChange={(e) => setTab(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: '1px solid var(--border)', width: '100%', marginBottom: 20 }}
        >
          <option value="articles">Bài viết ({articles.length})</option>
          <option value="tests">Bài kiểm tra (0)</option>
          <option value="practices">Thực hành (0)</option>
        </select>

        <div className="main-content">
          {tab === 'articles' && (
            articles.length ? (
              articles.map((a) => (
                <div key={a.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800 }}>
                    <Link to={`/blog/articles/${a.id}`} style={{ textDecoration: 'none', color: '#1f3a5d' }}>
                      {a.title}
                    </Link>
                  </h3>
                  <div style={{ color: 'var(--muted)', fontSize: 13.5, fontWeight: 600 }}>
                    ✍️ <strong>{a.author.name}</strong> • 📅 {formatDate(a.createdAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state"><p>😔 Không tìm thấy bài viết nào.</p></div>
            )
          )}
          {tab !== 'articles' && <div className="empty-state"><p>😔 Không tìm thấy kết quả.</p></div>}
        </div>
      </div>
    </Layout>
  );
}
