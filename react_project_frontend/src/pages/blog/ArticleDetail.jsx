import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import TopicTags from '../../components/TopicTags';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, formatDate } from '../../utils/date';
import { api } from '../../api/client';

export default function ArticleDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    api.get(`/api/blog/articles/${id}`).then((data) => {
      setArticle(data.article);
      setLikesCount(data.article?.like || 0);
      setLiked(!!data.user_liked_article);
      setComments(data.comments || []);
    });
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) return;
    const data = await api.post(`/api/blog/articles/${id}/like`);
    setLiked(data.liked);
    setLikesCount(data.like);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const data = await api.post(`/api/blog/articles/${id}/comment`, { content: commentText });
    setComments((prev) => [data.comment, ...prev]);
    setCommentText('');
  };

  if (!article) return <Layout><div className="loading">Đang tải...</div></Layout>;

  return (
    <Layout>
      <div className="grid-3">
        {/* Left sidebar - Series */}
        <aside>
          <div className="sidebar-box">
            <h3>📚 Series</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Chưa thuộc series nào</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="main-content">
          <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1f3a5d', marginBottom: 12, textAlign: 'left' }}>
              {article.title}
            </h1>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: 'var(--muted)', fontSize: 13.5, fontWeight: 600 }}>
              <span>✍️ <strong>{article.author.name}</strong></span>
              <span>📅 {formatDateTime(article.createdAt)}</span>
              <span>📌 {(article.topics || []).length} chủ đề</span>
            </div>
          </div>

          {article.topics?.length > 0 && (
            <div style={{ marginBottom: 24, padding: 14, background: 'var(--green-light)', borderLeft: '4px solid var(--green)', borderRadius: 6 }}>
              <h4 style={{ marginBottom: 8, fontSize: 13.5, fontWeight: 700 }}>📌 Chủ đề liên quan:</h4>
              <TopicTags topics={article.topics} solid />
            </div>
          )}

          <div
            style={{ fontSize: 15.5, lineHeight: 1.8, marginBottom: 32, whiteSpace: 'pre-line' }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Like section */}
          <div style={{
            margin: '32px 0', padding: 20, background: '#fffdf0',
            border: '1px solid #ffeeba', borderRadius: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              ❤️ <strong>{likesCount}</strong> người thích bài này
            </div>
            {isAuthenticated ? (
              <button
                onClick={handleLike}
                className="btn"
                style={{
                  background: liked ? '#ff6b6b' : 'var(--green)',
                  color: 'white',
                }}
              >
                {liked ? '♥️ Bỏ thích' : '🤍 Thích bài viết'}
              </button>
            ) : (
              <Link to="/blog/login" style={{ color: 'var(--green-dark)', fontWeight: 700 }}>
                🔓 Đăng nhập để thích bài viết
              </Link>
            )}
          </div>

          {/* Comments */}
          <section style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <h2 style={{
              fontSize: 18, fontWeight: 800, color: '#1f3a5d', marginBottom: 20,
              paddingBottom: 4, borderBottom: '2px solid var(--green)', display: 'inline-block',
            }}>
              💬 Bình luận ({comments.length})
            </h2>

            {isAuthenticated ? (
              <form onSubmit={handleComment} style={{
                background: 'var(--gray-bg)', padding: 18, borderRadius: 6,
                marginBottom: 24, border: '1px solid var(--border)',
              }}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Chia sẻ ý kiến của bạn..."
                  required
                  style={{
                    width: '100%', padding: 12, border: '1px solid var(--border)',
                    borderRadius: 6, fontSize: 14, resize: 'vertical', minHeight: 90, marginBottom: 10,
                  }}
                />
                <button type="submit" className="btn btn-green">💬 Gửi bình luận</button>
              </form>
            ) : (
              <div style={{ marginBottom: 24, textAlign: 'center', padding: 12, background: 'var(--gray-bg)', borderRadius: 6 }}>
                <Link to="/blog/login" style={{ color: 'var(--green-dark)', fontWeight: 700 }}>
                  🔓 Đăng nhập để bình luận
                </Link>
              </div>
            )}

            {comments.length ? (
              comments.map((c) => (
                <div key={c.id} style={{
                  marginBottom: 16, padding: 16, background: '#fff',
                  border: '1px solid var(--border)', borderLeft: '4px solid var(--green)', borderRadius: 6,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Link to={`/blog/users/${c.authorId}`} style={{ color: '#1f3a5d', fontWeight: 700, fontSize: 14 }}>
                      {c.author?.name || 'Ẩn danh'}
                    </Link>
                    <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>
                      {formatDateTime(c.createdAt)}
                    </span>
                  </div>
                  <div style={{ fontSize: 14.5, lineHeight: 1.6 }}>{c.content}</div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>📭 Chưa có bình luận nào. Hãy là người bình luận đầu tiên!</p>
              </div>
            )}
          </section>
        </main>

        {/* Right sidebar */}
        <aside>
          <div className="sidebar-box">
            <h3>ℹ️ Thông tin bài viết</h3>
            <div style={{ marginBottom: 12, fontSize: 13.5 }}>
              <label style={{ color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: 4 }}>Tác giả</label>
              <Link to={`/blog/users/${article.authorId}`} style={{ fontWeight: 700 }}>
                {article.author.name}
              </Link>
            </div>
            <div style={{ marginBottom: 12, fontSize: 13.5 }}>
              <label style={{ color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: 4 }}>Ngày đăng</label>
              <span style={{ fontWeight: 700 }}>{formatDate(article.createdAt)}</span>
            </div>
            <div style={{ marginBottom: 12, fontSize: 13.5 }}>
              <label style={{ color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: 4 }}>Lượt thích</label>
              <span style={{ fontWeight: 700 }}>{likesCount} ❤️</span>
            </div>
            {article.topics?.length > 0 && (
              <div style={{ marginBottom: 12, fontSize: 13.5 }}>
                <label style={{ color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: 4 }}>Chủ đề</label>
                <TopicTags topics={article.topics} solid />
              </div>
            )}
          </div>

          {isAuthenticated && user?.id === article.authorId && (
            <>
              <Link to={`/blog/articles/${article.id}/edit`} className="btn btn-warning" style={{ width: '100%', marginBottom: 8 }}>
                ✏️ Chỉnh sửa bài
              </Link>
              <Link to={`/blog/articles/${article.id}/delete`} className="btn btn-danger" style={{ width: '100%', marginBottom: 8 }}>
                🗑️ Xóa bài viết
              </Link>
            </>
          )}
          <Link to="/blog" className="btn btn-dark" style={{ width: '100%' }}>
            ← Quay lại trang chủ
          </Link>
        </aside>
      </div>
    </Layout>
  );
}
