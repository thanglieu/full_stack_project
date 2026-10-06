import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Pagination from '../../components/Pagination';
import TopicTags from '../../components/TopicTags';
import { api } from '../../api/client';

export default function ExamHome() {
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [tests, setTests] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    api.get(`/api/exam?page=${page}`).then((data) => {
      setTests(data.tests || []);
      setTotalPages(data.totalPages || 1);
    });
  }, [page]);

  return (
    <Layout>
      <main className="page-container">
        <h1>📝 Danh sách bài kiểm tra mới nhất</h1>

        <form className="search-form" onSubmit={(e) => {
          e.preventDefault();
          if (keyword.trim()) window.location.href = `/blog/search?keyword=${encodeURIComponent(keyword)}`;
        }}>
          <input type="text" placeholder="🔍 Tìm kiếm..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <button type="submit" className="btn btn-green">Tìm kiếm</button>
          <Link to="/blog/filter" className="btn btn-blue">Lọc chủ đề</Link>
          <Link to="/exam/create" className="btn btn-orange">✏️ Tạo Test</Link>
        </form>

        {tests.length ? (
          <ul className="item-list">
            {tests.map((test) => (
              <li key={test.id} className="item-card">
                <div>
                  <Link className="item-title" to={`/exam/test/${test.id}`}>
                    {test.title}
                  </Link>
                  <div className="item-meta">
                    Tác giả:{' '}
                    <Link to={`/blog/users/${test.author.id}`} style={{ color: 'var(--green-dark)', fontWeight: 700 }}>
                      {test.author.username}
                    </Link>
                    {' • '}
                    <strong>{test.quantity} câu hỏi</strong>
                  </div>
                  <TopicTags topics={test.topics} />
                </div>
                <Link to={`/exam/take/${test.id}`} className="btn btn-green">
                  Làm bài
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-result"><p>Chưa có bài test nào.</p></div>
        )}

        <Pagination page={page} totalPages={totalPages} />
      </main>
    </Layout>
  );
}
