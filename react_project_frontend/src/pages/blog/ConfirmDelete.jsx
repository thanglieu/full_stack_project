import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

export default function ConfirmDelete() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDelete = async () => {
    await api.delete(`/api/blog/articles/${id}`);
    navigate('/blog');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    }}>
      <div style={{
        background: 'white', padding: 40, borderRadius: 10,
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxWidth: 500, textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 22, color: '#e74c3c', marginBottom: 20 }}>🗑️ Xác nhận xóa</h1>
        <p style={{ fontSize: 16, color: '#2c3e50', marginBottom: 30 }}>
          Bạn có chắc muốn xóa bài viết này? Hành động không thể hoàn tác.
        </p>
        <div style={{ display: 'flex', gap: 15, justifyContent: 'center' }}>
          <button onClick={handleDelete} className="btn btn-danger" style={{ minWidth: 120, padding: 12 }}>
            Xóa
          </button>
          <Link to="/blog" className="btn btn-secondary" style={{ minWidth: 120, padding: 12 }}>
            Hủy
          </Link>
        </div>
      </div>
    </div>
  );
}
