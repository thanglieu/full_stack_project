import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Pagination from '../../components/Pagination';
import TopicTags from '../../components/TopicTags';
import { api } from '../../api/client';

export default function PracticeHome() {
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [practices, setPractices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/practice?page=${page}`)
      .then((data) => {
        setPractices(data.practices || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => { setPractices([]); setTotalPages(1); })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Layout>
      <main className="page-container">
        <h1>📝 Danh sách Practice</h1>

        <form className="search-form" onSubmit={(e) => {
          e.preventDefault();
          if (keyword.trim()) window.location.href = `/blog/search?keyword=${encodeURIComponent(keyword)}&form=search`;
        }}>
          <input type="text" placeholder="🔍 Tìm kiếm..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <button type="submit" className="btn btn-green">Tìm kiếm</button>
          <Link to="/blog/filter" className="btn btn-blue">Lọc chủ đề</Link>
          <Link to="/practice/create" className="btn btn-orange">✏️ Tạo Practice</Link>
        </form>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : practices.length ? (
          <ul className="item-list">
            {practices.map((p) => (
              <li key={p.id} className="item-card">
                <div>
                  <Link className="item-title" to={`/practice/${p.id}`}>
                    {p.title}
                  </Link>
                  <div className="item-meta">
                    Tác giả:{' '}
                    <Link to={`/blog/users/${p.author.id}`} style={{ color: 'var(--green-dark)', fontWeight: 700 }}>
                      {p.author.username}
                    </Link>
                  </div>
                  <TopicTags topics={p.topics} />
                </div>
                <Link to={`/practice/${p.id}/take`} className="btn btn-green">
                  Làm bài
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-result"><p>Không tìm thấy bài practice nào.</p></div>
        )}

        <Pagination page={page} totalPages={totalPages} />
      </main>
    </Layout>
  );
}
