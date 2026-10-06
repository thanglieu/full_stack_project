import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import TopicTags from '../../components/TopicTags';
import { api } from '../../api/client';

export default function UserPracticeList() {
  const { id } = useParams();
  const [practice, setPractice] = useState(null);
  const [userPractices, setUserPractices] = useState([]);

  useEffect(() => {
    api.get(`/api/practice/${id}`).then((data) => {
      setPractice(data.practice);
      setUserPractices(data.user_practices || []);
    });
  }, [id]);

  if (!practice) return <Layout><div className="loading">Đang tải...</div></Layout>;

  return (
    <Layout>
      <main className="page-container">
        <h1>📝 Practice: {practice.title}</h1>

        <div className="main-content" style={{ marginBottom: 24 }}>
          <p><strong>Người tạo:</strong> {practice.author.username}</p>
          <p><strong>Nội dung:</strong><br />{practice.content}</p>
          <p><strong>Số người đã làm:</strong> {userPractices.length}</p>
          <p><strong>Chủ đề:</strong></p>
          <TopicTags topics={practice.topics} solid />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Danh sách người làm</h2>
        {userPractices.length ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Người dùng</th>
                  <th>Điểm</th>
                </tr>
              </thead>
              <tbody>
                {userPractices.map((item, index) => (
                  <tr key={item.user.id}>
                    <td>{index + 1}</td>
                    <td>{item.user.username}</td>
                    <td>{item.mark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 32, background: '#fff', borderRadius: 8, border: '1px solid var(--border)', textAlign: 'center', color: 'var(--muted)', fontWeight: 600 }}>
            <p>Chưa có ai hoàn thành bài này.</p>
          </div>
        )}

        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          <Link to={`/blog/users/${practice.author.id}`} className="btn btn-green">Quay lại</Link>
          <Link to={`/practice/${practice.id}/take`} className="btn btn-green">Làm</Link>
        </div>
      </main>
    </Layout>
  );
}
