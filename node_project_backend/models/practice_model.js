const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  getAllTopics: () => prisma.topic.findMany(),

  getPractices: (skip, take) =>
    prisma.practice.findMany({
      orderBy: { id: 'desc' },
      skip,
      take,
      include: { author: true, topics: true },
    }),

  countPractices: () => prisma.practice.count(),

  findPracticeById: (id) =>
    prisma.practice.findUnique({
      where: { id: Number(id) },
      include: { author: true, topics: true, testCases: { orderBy: { stt: 'asc' } } },
    }),

  createPractice: (data) => prisma.practice.create({ data }),

  createTestCase: (data) => prisma.testCase.create({ data }),

  getTestCases: (practiceId) =>
    prisma.testCase.findMany({
      where: { practiceId: Number(practiceId) },
      orderBy: { stt: 'asc' },
    }),

  findUserPractice: (userId, practiceId) =>
    prisma.userPractice.findUnique({
      where: {
        userId_practiceId: {
          userId: Number(userId),
          practiceId: Number(practiceId),
        },
      },
    }),

  upsertUserPractice: (userId, practiceId, data) =>
    prisma.userPractice.upsert({
      where: {
        userId_practiceId: {
          userId: Number(userId),
          practiceId: Number(practiceId),
        },
      },
      create: {
        userId: Number(userId),
        practiceId: Number(practiceId),
        ...data,
      },
      update: data,
    }),

  getUserPracticesByPractice: (practiceId) =>
    prisma.userPractice.findMany({
      where: { practiceId: Number(practiceId) },
      include: { user: true },
      orderBy: { mark: 'desc' },
    }),

  findUserPracticeByUser: (practiceId, userId) =>
    prisma.userPractice.findUnique({
      where: {
        userId_practiceId: {
          userId: Number(userId),
          practiceId: Number(practiceId),
        },
      },
      include: { user: true, practice: true },
    }),
};