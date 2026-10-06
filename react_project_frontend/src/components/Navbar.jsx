import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <Link className="nav-logo" to="/blog">
        PTIT<span>Share</span>
      </Link>

      <div className="nav-dropdown">
        <div className="nav-dropdown-btn">
          Khám phá
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" viewBox="0 0 16 16">
            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
          </svg>
        </div>
        <div className="nav-dropdown-menu">
          <Link to="/blog">Blog</Link>
          <Link to="/exam">Exam</Link>
          <Link to="/practice">Practice</Link>
        </div>
      </div>

      <div className="nav-spacer" />
      <div className="nav-divider" />

      {isAuthenticated ? (
        <>
          <Link to={`/blog/users/${user.id}`} className={isActive(`/blog/users/${user.id}`)}>
            Trang cá nhân
          </Link>
          <Link to="/blog/users/rank" className={isActive('/blog/users/rank')}>
            Xếp hạng
          </Link>
          <Link
            to="/blog/login"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              logout();
              window.location.href = '/blog/login';
            }}
          >
            Đăng xuất
          </Link>
        </>
      ) : (
        <>
          <Link to="/blog/login" className="nav-link">Đăng nhập</Link>
          <Link to="/blog/register" className="nav-link">Đăng ký</Link>
        </>
      )}
    </nav>
  );
}
