const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog_controller');

// Auth
router.post('/login', blogController.login);
router.post('/register', blogController.register);
router.get('/logout', blogController.logout);
router.get('/me', blogController.me);               // MỚI — frontend gọi lúc mount để biết ai đang đăng nhập

// Home / search / filter
router.get('/', blogController.home);
router.get('/search', blogController.search);
router.get('/filter', blogController.filter);

// Users
router.get('/users/this-user', blogController.userPage);
router.get('/users/rank', blogController.userRank);
router.all('/users/:pk', blogController.userDetail);

// Articles
router.get('/articles/new', blogController.createArticle);
router.post('/articles/new', blogController.createArticle);
router.all('/articles/:article_id', blogController.articleDetail);
router.post('/articles/:article_id/comment', blogController.createComment);
router.post('/articles/:article_id/like', blogController.likeArticle);
router.all('/articles/:pk/edit', blogController.editArticle);
router.all('/articles/:pk/delete', blogController.deleteArticle);

module.exports = router;
