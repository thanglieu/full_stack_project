import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api.post('/api/blog/login', { username, password });
      login(data.user);
      // Nếu bị ProtectedRoute chuyển tới đây, quay lại đúng trang họ định vào
      navigate(location.state?.from?.pathname || '/blog', { replace: true });
    } catch (err) {
      setError(err.message || 'Sai tài khoản hoặc mật khẩu');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="logo">📖</div>
          <h2>Đăng nhập</h2>
          <p>Tham gia cộng đồng Blog của chúng tôi</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-green" style={{ width: '100%', padding: 12, fontSize: 16 }}>
            🔓 Đăng nhập
          </button>
        </form>

        <div className="auth-link">
          <p>
            Bạn chưa có tài khoản? <Link to="/blog/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
