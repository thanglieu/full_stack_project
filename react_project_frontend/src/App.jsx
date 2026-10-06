import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Blog
import Home from './pages/blog/Home';
import ArticleDetail from './pages/blog/ArticleDetail';
import CreateArticle from './pages/blog/CreateArticle';
import Filter from './pages/blog/Filter';
import Search from './pages/blog/Search';
import Login from './pages/blog/Login';
import Register from './pages/blog/Register';
import UserProfile from './pages/blog/UserProfile';
import Ranking from './pages/blog/Ranking';
import ConfirmDelete from './pages/blog/ConfirmDelete';

// Exam
import ExamHome from './pages/exam/ExamHome';
import CreateTest from './pages/exam/CreateTest';
import TakeTest from './pages/exam/TakeTest';
import TestResult from './pages/exam/TestResult';
import UserTestList from './pages/exam/UserTestList';

// Practice
import PracticeHome from './pages/practice/PracticeHome';
import CreatePractice from './pages/practice/CreatePractice';
import TakePractice from './pages/practice/TakePractice';
import CodeRunner from './pages/practice/CodeRunner';
import UserPracticeList from './pages/practice/UserPracticeList';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/blog" replace />} />

          {/* ===== Blog ===== */}
          <Route path="/blog" element={<Home />} />
          <Route path="/blog/search" element={<Search />} />
          <Route path="/blog/filter" element={<Filter />} />
          <Route path="/blog/login" element={<Login />} />
          <Route path="/blog/register" element={<Register />} />
          <Route path="/blog/users/rank" element={<Ranking />} />
          <Route path="/blog/users/:id" element={<UserProfile />} />
          <Route path="/blog/articles/new" element={<CreateArticle />} />
          <Route path="/blog/articles/:id" element={<ArticleDetail />} />
          <Route path="/blog/articles/:id/edit" element={<CreateArticle />} />
          <Route path="/blog/articles/:id/delete" element={<ConfirmDelete />} />

          {/* ===== Exam ===== */}
          <Route path="/exam" element={<ExamHome />} />
          <Route path="/exam/create" element={<CreateTest />} />
          <Route path="/exam/take/:id" element={<TakeTest />} />
          <Route path="/exam/test/:id" element={<UserTestList />} />
          <Route path="/exam/test/result/:id" element={<TestResult />} />

          {/* ===== Practice ===== */}
          <Route path="/practice" element={<PracticeHome />} />
          <Route path="/practice/create" element={<CreatePractice />} />
          <Route path="/practice/run-code" element={<CodeRunner />} />
          <Route path="/practice/:id" element={<UserPracticeList />} />
          <Route path="/practice/:id/take" element={<TakePractice />} />

          {/* 404 */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: 80 }}>
              <h1>404</h1>
              <p>Trang không tồn tại</p>
              <a href="/blog" style={{ color: 'var(--green)', fontWeight: 700 }}>← Về trang chủ</a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
