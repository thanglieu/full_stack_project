import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/date';
import { api } from '../../api/client';

export default function UserProfile() {
  const { id } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('articles');
  const [seriesName, setSeriesName] = useState('');

  useEffect(() => {
    if (authLoading) return; // đợi biết currentUser trước khi resolve "this-user"
    const uid = id === 'this-user' ? currentUser?.id : Number(id);
    if (!uid) return;

    // API CALL GỌI ĐẾN BACKEND
    api.get(`/api/blog/users/${uid}`).then((data) => {
      setProfile({ ...data.user, articles: data.articles || [] });
    });
  }, [id, currentUser, authLoading]);

  const handleCreateSeries = async (e) => {
    e.preventDefault();
    if (!seriesName.trim()) return;
    await api.post(`/api/blog/users/${profile.id}`, { form: 'create_series', name: seriesName });
    setSeriesName('');
  };

  if (!profile) return <Layout><div className="loading">Đang tải...</div></Layout>;

  const isOwner = currentUser?.id === profile.id;

  return (
    <Layout>
      <div className="grid-3" style={{ gridTemplateColumns: '280px 1fr 280px' }}>
        <aside>
          <div className="sidebar-box" style={{ textAlign: 'center' }}>
            <div style={{
              width: '100%', height: 200, background: 'var(--green)', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 60, color: 'white', marginBottom: 20,
            }}>
              👤
            </div>
            <h2 style={{ fontSize: 20, marginBottom: 20 }}>{profile.name}</h2>
            <div style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: 18, paddingBottom: 15, borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ color: '#7f8c8d', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>👤 Tên đăng nhập</div>
                <div style={{ fontWeight: 600 }}>{profile.username}</div>
              </div>
              <div style={{ marginBottom: 18, paddingBottom: 15, borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ color: '#7f8c8d', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>📧 Email</div>
                <div style={{ fontWeight: 600 }}>{profile.email}</div>
              </div>
              {profile.gender && (
                <div style={{ marginBottom: 18, paddingBottom: 15, borderBottom: '1px solid #e0e0e0' }}>
                  <div style={{ color: '#7f8c8d', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>⚧️ Giới tính</div>
                  <div style={{ fontWeight: 600 }}>{profile.gender}</div>
                </div>
              )}
              {profile.birth && (
                <div style={{ marginBottom: 18, paddingBottom: 15, borderBottom: '1px solid #e0e0e0' }}>
                  <div style={{ color: '#7f8c8d', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>📅 Ngày sinh</div>
                  <div style={{ fontWeight: 600 }}>{formatDate(profile.birth)}</div>
                </div>
              )}
              <div style={{
                background: '#fff3cd', border: '2px solid #ffc107', color: '#856404',
                padding: 12, borderRadius: 6, textAlign: 'center', fontSize: 18, fontWeight: 700, marginTop: 15,
              }}>
                ⭐ {profile.mark} Điểm
              </div>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
            <h2 style={{ fontSize: 22, color: '#2c3e50', paddingBottom: 12, borderBottom: '3px solid var(--green)', display: 'inline-block' }}>
              Nội dung của {profile.name}
            </h2>
            <select value={tab} onChange={(e) => setTab(e.target.value)} style={{ padding: 8, borderRadius: 5, border: '1px solid #ccc' }}>
              <option value="articles">Bài viết</option>
              <option value="tests">Bài Test</option>
              <option value="practices">Practice</option>
            </select>
          </div>

          {tab === 'articles' && (
            profile.articles?.length ? (
              profile.articles.map((a) => (
                <div key={a.id} style={{
                  padding: 18, background: '#f9f9f9', borderLeft: '4px solid var(--green)',
                  borderRadius: 6, marginBottom: 18,
                }}>
                  <Link to={`/blog/articles/${a.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3>{a.title}</h3>
                    <div style={{ color: 'var(--muted)', fontSize: 13 }}>📅 {formatDate(a.createdAt)}</div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="empty-state"><p>📭 Chưa có bài viết nào</p></div>
            )
          )}
          {tab === 'tests' && <div className="empty-state"><p>📭 Chưa có bài Test nào</p></div>}
          {tab === 'practices' && <div className="empty-state"><p>📭 Chưa có Practice nào</p></div>}


        </main>

        <aside>
          {isOwner && (
            <div className="sidebar-box" style={{ marginBottom: 20 }}>
              <h3 style={{ color: 'var(--green-dark)' }}>📚 Tạo Series mới</h3>
              <form onSubmit={handleCreateSeries}>
                <input
                  type="text"
                  placeholder="Tên series"
                  value={seriesName}
                  onChange={(e) => setSeriesName(e.target.value)}
                  required
                  style={{ width: '100%', padding: 8, marginBottom: 10, borderRadius: 4, border: '1px solid var(--border)' }}
                />
                <button type="submit" className="btn btn-green" style={{ width: '100%' }}>Tạo Series mới</button>
              </form>
            </div>
          )}
          <div className="sidebar-box">
            <h3>Danh sách Series</h3>
            <p style={{ color: '#999', fontSize: 13 }}>Chưa có series nào.</p>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
