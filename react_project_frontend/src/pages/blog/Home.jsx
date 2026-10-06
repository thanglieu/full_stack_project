import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Pagination from '../../components/Pagination';
import TopicTags from '../../components/TopicTags';
import { formatDateTime } from '../../utils/date';
import { api } from '../../api/client';

export default function Home() {
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/blog?page=${page}`)
      .then((data) => {
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => { setPosts([]); setTotalPages(1); })
      .finally(() => setLoading(false));
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      window.location.href = `/blog/search?keyword=${encodeURIComponent(keyword)}`;
    }
  };

  return (
    <Layout>
      <main className="page-container">
        <h1>📝 Danh sách bài viết mới nhất</h1>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm bài viết..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="btn btn-green">Tìm kiếm</button>
          <Link to="/blog/filter" className="btn btn-blue">Lọc chủ đề</Link>
          <Link to="/blog/articles/new" className="btn btn-orange">✏️ Tạo bài</Link>
        </form>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : posts.length ? (
          <ul className="item-list">
            {posts.map((post) => (
              <li key={post.id} className="item-card">
                <div>
                  <Link className="item-title" to={`/blog/articles/${post.id}`}>
                    {post.title}
                  </Link>
                  <div className="item-meta">
                    Tác giả:{' '}
                    <Link to={`/blog/users/${post.author.id}`} style={{ color: 'var(--green-dark)', fontWeight: 700 }}>
                      {post.author.username}
                    </Link>
                    {' • '}
                    {formatDateTime(post.createdAt)}
                    {' • '}
                    {post.like || 0} ❤️
                  </div>
                  <TopicTags topics={post.topics} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-result"><p>Chưa có bài viết nào.</p></div>
        )}

        <Pagination page={page} totalPages={totalPages} />
      </main>
    </Layout>
  );
}
