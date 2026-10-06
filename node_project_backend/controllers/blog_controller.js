const bcrypt = require('bcryptjs');
// Nếu vẫn muốn dùng Passport Local chỉ để check username/password:
const passport = require('../middlewares/passport');
const blogModel = require('../models/blog_model');
const { issueTokens, clearTokens } = require('../middlewares/auth');

// ========== AUTH ==========
// showLogin / showRegister: KHÔNG cần nữa — React tự render các trang này (Login.jsx, Register.jsx)

// hàm đăng nhập (chú ý tránh nhầm lẫn với hàm duy trì đăng nhập auth/loginRequired)
exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Sai tài khoản' });
    }

    // JWT có refresh token
    issueTokens(user, res);
    const { password, ...safeUser } = user;
    return res.json({ user: safeUser });
  })(req, res, next);
};

exports.register = async (req, res) => {
  try {
    const { username, password, name, gender, birth, email } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const user = await blogModel.createUser({
      username,
      password: hashed,
      name,
      gender,
      birth: birth ? new Date(birth) : null,
      email,
    });

    const { password: _pw, ...safeUser } = user;
    return res.status(201).json({ user: safeUser });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.logout = (req, res) => {
  clearTokens(res);
  return res.json({ message: 'Đã đăng xuất' });
};

// THÊM VÀO ĐỂ XÁC THỰC QUA API TRONG FULL STACK
// Frontend gọi hook này lúc mount (AuthContext) để biết ai đang đăng nhập,
// vì token nằm trong cookie httpOnly nên JS phía client không đọc được trực tiếp.
exports.me = (req, res) => {
  if (!req.user) return res.status(401).json({ user: null });
  return res.json({ user: req.user });
};

// ========== USER ==========
exports.userPage = (req, res) => {
  // trước đây: redirect sang /blog/users/:id — giờ trả thẳng id, để React tự điều hướng nếu cần
  // res.redirect('/blog/users/{req.user?.id}')
  return res.json({ id: req.user?.id });
};

exports.userDetail = async (req, res) => {
  try {
    // lấy tham số pk từ '/users/:pk' (xem trong router)
    const pk = Number(req.params.pk);

    // tìm User theo id = pk
    const user = await blogModel.findUserById(pk);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

    // với GET request
    if (req.method === 'GET') {
      const series = await blogModel.getSeriesByAuthor(user.id);
      const k = series.map((s) => [
        s,
        s.articleLists?.[0]?.article || null,
      ]);
      const articles = await blogModel.getArticlesByAuthor(user.id);
      const { password, ...safeUser } = user;
      return res.json({ user: safeUser, k, articles });
    }

    // với POST request
    const currentUserId = req.user?.id;
    if (user.id !== currentUserId) {
      return res.status(403).json({ message: 'Không có quyền thực hiện thao tác này' });
    }

    if (req.body.form === 'create_series') {
      await blogModel.createSeries({
        name: req.body.name,
        authorId: currentUserId,
      });
    } else if (req.body.form) {
      await blogModel.deleteSeries(req.body.form);
    }

    if (req.body.form2) {
      await blogModel.deleteArticle(req.body.form2);
    }

    // form3 / form4: Test & Practice (module khác) — để trống hoặc gọi model tương ứng

    return res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.userRank = async (req, res) => {
  const users = await blogModel.getUsersByMark();
  return res.json({ users });
};

// ========== HOME / SEARCH / FILTER ==========
exports.articleList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    blogModel.getArticles(skip, limit),
    blogModel.countArticles(),
  ]);

  return res.json({
    posts,
    page,
    totalPages: Math.ceil(total / limit),
  });
};

exports.home = async (req, res) => {
  if (!req.query.form) return exports.articleList(req, res);
  if (req.query.form === 'search') return exports.search(req, res);
  return res.status(400).json({ message: 'Yêu cầu không hợp lệ' });
};

exports.search = async (req, res) => {
  const k = (req.query.keyword || '').trim();
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  let articles = [], users = [];
  // tests, practices: gọi model exam/practice khi có

  if (k) {
    articles = await blogModel.searchArticles(k, skip, limit);
    users = await blogModel.searchUsers(k, skip, 9);
  }

  return res.json({
    articles,
    users,
    tests: [],
    practices: [],
    keyword: k,
  });
};

exports.filter = async (req, res) => {
  const topics = await blogModel.getAllTopics();
  const selectedTopics = [].concat(req.query.topics || []);
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const articles = selectedTopics.length
    ? await blogModel.filterArticlesByTopics(selectedTopics, skip, limit)
    : [];

  return res.json({
    topics,
    articles,
    tests: [],
    practices: [],
    selected_topics: selectedTopics,
  });
};

// ========== ARTICLE ==========
exports.createArticle = async (req, res) => {
  if (req.method === 'GET') {
    const topics = await blogModel.getAllTopics();
    return res.json({ topics, article: null });
  }

  try {
    const { title, content, topic } = req.body;
    const topicIds = [].concat(topic || []).filter(Boolean).map(Number);
    const authorId = req.user?.id;

    const article = await blogModel.createArticle({
      title,
      content,
      authorId,
      topics: { connect: topicIds.map((id) => ({ id })) },
    });

    return res.status(201).json({ article });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.articleDetail = async (req, res) => {
  const articleId = Number(req.params.article_id);
  const currentUserId = req.user?.id;

  if (req.method === 'GET') {
    const article = await blogModel.findArticleById(articleId);
    if (!article) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

    const comments = await blogModel.getCommentsByArticle(articleId);
    const like = currentUserId
      ? await blogModel.findLike(currentUserId, articleId)
      : null;

    const listItem = await blogModel.findArticleListByArticle(articleId);
    const thisSeries = listItem?.series || null;

    let articlesSeries = [];
    if (thisSeries) {
      const list = await blogModel.getArticlesInSeries(thisSeries.id);
      articlesSeries = list.map((i) => i.article);
    }

    const series = await blogModel.getSeriesByAuthor(currentUserId);

    return res.json({
      article,
      comments,
      user_liked_article: !!like,
      series,
      articles: articlesSeries,
      this_series: thisSeries,
    });
  }

  // POST add/delete series
  if (req.body.form === 'add') {
    const series = await blogModel.findSeriesByName(req.body.series);
    if (series) await blogModel.addArticleToSeries(series.id, articleId);
    return res.json({ message: 'Đã thêm vào series' });
  }

  if (req.body.form === 'delete') {
    const listItem = await blogModel.findArticleListByArticle(articleId);
    if (listItem) {
      await blogModel.removeArticleFromSeries(listItem.seriesId, articleId);
    }
    return res.json({ message: 'Đã xoá khỏi series' });
  }

  return res.status(400).json({ message: 'Yêu cầu không hợp lệ' });
};

exports.createComment = async (req, res) => {
  const articleId = Number(req.params.article_id);
  const authorId = req.user?.id;

  if (req.body.content) {
    const comment = await blogModel.createComment({
      content: req.body.content,
      authorId,
      articleId,
    });
    return res.status(201).json({ comment });
  }

  return res.status(400).json({ message: 'Nội dung bình luận không được để trống' });
};

exports.likeArticle = async (req, res) => {
  const articleId = Number(req.params.article_id);
  const userId = req.user?.id;

  const article = await blogModel.findArticleById(articleId);
  if (!article) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

  const existing = await blogModel.findLike(userId, articleId);
  let liked;

  if (existing) {
    await blogModel.deleteLike(existing.id);
    await blogModel.updateUserMark(article.authorId, -1);
    await blogModel.updateArticleLikeCount(articleId, -1);
    liked = false;
  } else {
    await blogModel.createLike(userId, articleId);
    await blogModel.updateUserMark(article.authorId, 1);
    await blogModel.updateArticleLikeCount(articleId, 1);
    liked = true;
  }

  return res.json({ liked, like: article.like + (liked ? 1 : -1) });
};

exports.editArticle = async (req, res) => {
  const pk = Number(req.params.pk);
  const article = await blogModel.findArticleById(pk);
  if (!article) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

  if (req.method === 'GET') {
    const topics = await blogModel.getAllTopics();
    return res.json({
      article,
      topics,
      selectedTopics: article.topics.map((t) => t.id),
    });
  }

  const { title, content, topic } = req.body;
  const topicIds = [].concat(topic || []).filter(Boolean).map(Number);

  const updated = await blogModel.updateArticle(pk, {
    title,
    content,
    authorId: req.user?.id,
    topics: {
      set: topicIds.map((id) => ({ id })),
    },
  });

  return res.json({ article: updated });
};

exports.deleteArticle = async (req, res) => {
  // Trang xác nhận (GET) không cần nữa — React tự hiện dialog xác nhận phía client
  await blogModel.deleteArticle(req.params.pk);
  return res.json({ message: 'Đã xoá bài viết' });
};

// errorPage: không cần nữa — mỗi hàm trên đã tự trả status code + message JSON khi có lỗi
