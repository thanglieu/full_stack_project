import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { api } from '../../api/client';

export default function Ranking() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/api/blog/users/rank').then((data) => setUsers(data.users || []));
  }, []);

  return (
    <Layout>
      <div className="page-container">
        <h1>🏆 Bảng xếp hạng</h1>
        {users.length ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Giới tính</th>
                  <th>Điểm</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td className="rank-column">{i + 1}</td>
                    <td><Link to={`/blog/users/${u.id}`}>{u.name}</Link></td>
                    <td>{u.email}</td>
                    <td>{u.gender || '—'}</td>
                    <td className="mark-cell">{u.mark} ⭐</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><p>📭 Chưa có người dùng nào.</p></div>
        )}
      </div>
    </Layout>
  );
}
