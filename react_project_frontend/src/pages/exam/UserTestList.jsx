import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import TopicTags from '../../components/TopicTags';
import { api } from '../../api/client';

export default function UserTestList() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [userTests, setUserTests] = useState([]);

  useEffect(() => {
    api.get(`/api/exam/test/${id}`).then((data) => {
      setTest(data.test);
      setUserTests(data.user_tests || []);
    });
  }, [id]);

  if (!test) return <Layout><div className="loading">Đang tải...</div></Layout>;

  return (
    <Layout>
      <main className="page-container">
        <h1>📝 Bài Test: {test.title}</h1>

        <div className="main-content" style={{ marginBottom: 24 }}>
          <p><strong>Số câu hỏi :</strong> {test.quantity}</p>
          <p><strong>Người tạo :</strong> {test.author.username}</p>
          <p><strong>Số người đã làm :</strong> {userTests.length}</p>
          <p><strong>Chủ đề :</strong></p>
          <TopicTags topics={test.topics} solid />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Danh sách người làm Test</h2>
        {userTests.length ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Điểm</th>
                </tr>
              </thead>
              <tbody>
                {userTests.map((ut) => (
                  <tr key={ut.id}>
                    <td><Link to={`/blog/users/${ut.user.id}`}>{ut.user.username}</Link></td>
                    <td>{ut.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-results" style={{ padding: 32, background: '#fff', borderRadius: 8, border: '1px solid var(--border)', textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>
            <p>Chưa có ai hoàn thành bài kiểm tra này.</p>
          </div>
        )}

        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          <Link to={`/blog/users/${test.author.id}`} className="btn btn-green">Quay lại</Link>
          <Link to={`/exam/take/${test.id}`} className="btn btn-green">Làm</Link>
        </div>
      </main>
    </Layout>
  );
}
