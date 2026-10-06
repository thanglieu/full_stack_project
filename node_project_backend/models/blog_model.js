const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
  prisma,

  // User
  findUserById: (id) => prisma.user.findUnique({ where: { id: Number(id) } }),
  findUserByUsername: (username) => prisma.user.findUnique({ where: { username } }),
  createUser: (data) => prisma.user.create({ data }),
  getUsersByMark: () => prisma.user.findMany({ orderBy: { mark: 'desc' } }),
  searchUsers: (keyword, skip, take) =>
    prisma.user.findMany({
      where: { name: { contains: keyword } },
      skip,
      take,
    }),

  // Topic
  getAllTopics: () => prisma.topic.findMany(),

  // Series
  getSeriesByAuthor: (authorId) =>
    prisma.series.findMany({
      where: { authorId: Number(authorId) },
      include: { articleLists: { include: { article: true }, take: 1 } },
    }),
  createSeries: (data) => prisma.series.create({ data }),
  deleteSeries: (id) => prisma.series.delete({ where: { id: Number(id) } }),
  findSeriesByName: (name) => prisma.series.findFirst({ where: { name } }),

  // Article
  getArticles: (skip, take) =>
    prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { author: true, topics: true },
    }),
  countArticles: () => prisma.article.count(),
  findArticleById: (id) =>
    prisma.article.findUnique({
      where: { id: Number(id) },
      include: { author: true, topics: true },
    }),
  createArticle: (data) => prisma.article.create({ data }),
  getArticlesByAuthor: (authorId) =>
    prisma.article.findMany({
      where: { authorId: Number(authorId) },
      orderBy: { createdAt: 'desc' },
      include: { topics: true },
    }),
  updateArticle: (id, data) =>
    prisma.article.update({ where: { id: Number(id) }, data }),
  deleteArticle: (id) => prisma.article.delete({ where: { id: Number(id) } }),
  searchArticles: (keyword, skip, take) =>
    prisma.article.findMany({
      where: { title: { contains: keyword } },
      skip,
      take,
      include: { author: true },
    }),
  filterArticlesByTopics: (topicIds, skip, take) =>
    prisma.article.findMany({
      where: { topics: { some: { id: { in: topicIds.map(Number) } } } },
      skip,
      take,
      distinct: ['id'],
      include: { author: true, topics: true },
    }),

  // ArticleList
  findArticleListByArticle: (articleId) =>
    prisma.articleList.findFirst({
      where: { articleId: Number(articleId) },
      include: { series: true },
    }),
  getArticlesInSeries: (seriesId) =>
    prisma.articleList.findMany({
      where: { seriesId: Number(seriesId) },
      include: { article: true },
      orderBy: { id: 'asc' },
    }),
  addArticleToSeries: (seriesId, articleId) =>
    prisma.articleList.create({
      data: { seriesId: Number(seriesId), articleId: Number(articleId) },
    }),
  removeArticleFromSeries: (seriesId, articleId) =>
    prisma.articleList.deleteMany({
      where: { seriesId: Number(seriesId), articleId: Number(articleId) },
    }),

  // Comment
  getCommentsByArticle: (articleId) =>
    prisma.comment.findMany({
      where: { articleId: Number(articleId) },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    }),
  createComment: (data) => prisma.comment.create({ data, include: { author: true } }),

  // Like
  findLike: (userId, articleId) =>
    prisma.like.findUnique({
      where: {
        userId_articleId: {
          userId: Number(userId),
          articleId: Number(articleId),
        },
      },
    }),
  createLike: (userId, articleId) =>
    prisma.like.create({
      data: { userId: Number(userId), articleId: Number(articleId) },
    }),
  deleteLike: (id) => prisma.like.delete({ where: { id: Number(id) } }),
  updateArticleLikeCount: (articleId, delta) =>
    prisma.article.update({
      where: { id: Number(articleId) },
      data: { like: { increment: delta } },
    }),
  updateUserMark: (userId, delta) =>
    prisma.user.update({
      where: { id: Number(userId) },
      data: { mark: { increment: delta } },
    }),
};