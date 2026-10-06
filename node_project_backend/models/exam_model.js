const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  prisma,

  // Topic (dùng chung blog)
  getAllTopics: () => prisma.topic.findMany(),

  // Test
  getTests: (skip, take) =>
    prisma.test.findMany({
      orderBy: { id: 'desc' },
      skip,
      take,
      include: { author: true, topics: true },
    }),
  countTests: () => prisma.test.count(),
  findTestById: (id) =>
    prisma.test.findUnique({
      where: { id: Number(id) },
      include: { author: true, topics: true },
    }),
  createTest: (data) => prisma.test.create({ data }),

  // Question
  getQuestionsByTest: (testId) =>
    prisma.question.findMany({
      where: { testId: Number(testId) },
      orderBy: [{ stt: 'asc' }, { id: 'asc' }],
      include: { answers: { orderBy: { id: 'asc' } } },
    }),
  createQuestion: (data) => prisma.question.create({ data }),

  // Answer
  createAnswer: (data) => prisma.answer.create({ data }),
  findAnswerById: (id, questionId) =>
    prisma.answer.findFirst({
      where: { id: Number(id), questionId: Number(questionId) },
    }),
  getAnswersByQuestion: (questionId) =>
    prisma.answer.findMany({
      where: { questionId: Number(questionId) },
      orderBy: { id: 'asc' },
    }),

  // UserTest
  findUserTest: (userId, testId) =>
    prisma.userTest.findUnique({
      where: {
        userId_testId: {
          userId: Number(userId),
          testId: Number(testId),
        },
      },
    }),
  upsertUserTest: (userId, testId) =>
    prisma.userTest.upsert({
      where: {
        userId_testId: {
          userId: Number(userId),
          testId: Number(testId),
        },
      },
      create: { userId: Number(userId), testId: Number(testId) },
      update: {},
    }),
  updateUserTestScore: (id, score) =>
    prisma.userTest.update({
      where: { id: Number(id) },
      data: { score },
    }),
  findUserTestById: (id, userId) =>
    prisma.userTest.findFirst({
      where: { id: Number(id), userId: Number(userId) },
      include: { test: true, user: true },
    }),
  getUserTestsByTest: (testId) =>
    prisma.userTest.findMany({
      where: { testId: Number(testId) },
      include: { user: true },
      orderBy: [{ score: 'desc' }, { user: { username: 'asc' } }],
    }),

  // UserAnswer
  deleteUserAnswers: (userTestId) =>
    prisma.userAnswer.deleteMany({
      where: { userTestId: Number(userTestId) },
    }),
  createUserAnswer: (userTestId, answerId) =>
    prisma.userAnswer.create({
      data: {
        userTestId: Number(userTestId),
        answerId: Number(answerId),
      },
    }),
  getUserAnswers: (userTestId) =>
    prisma.userAnswer.findMany({
      where: { userTestId: Number(userTestId) },
      include: {
        answer: {
          include: { question: true },
        },
      },
    }),
};


