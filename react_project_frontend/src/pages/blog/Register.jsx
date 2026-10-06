import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    password2: '',
    name: '',
    gender: 'Nam',
    birth: '',
    email: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      const { password2, ...payload } = form;
      await api.post('/api/blog/register', payload);
      navigate('/blog/login');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: 450 }}>
        <div className="auth-header">
          <div className="logo">📖</div>
          <h2>Tạo tài khoản</h2>
          <p>Tham gia cộng đồng Blog hiện đại</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input name="password2" type="password" value={form.password2} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Họ tên</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
            <div className="form-group">
              <label>Giới tính</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ngày sinh</label>
              <input name="birth" type="date" value={form.birth} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-green" style={{ width: '100%', padding: 12, fontSize: 16 }}>
            ✓ Đăng ký ngay
          </button>
        </form>

        <div className="auth-link">
          <p>
            Bạn đã có tài khoản? <Link to="/blog/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
