import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, hideNav = false }) {
  return (
    <div className="app-layout">
      {!hideNav && <Navbar />}
      {children}
      {!hideNav && <Footer />}
    </div>
  );
}
