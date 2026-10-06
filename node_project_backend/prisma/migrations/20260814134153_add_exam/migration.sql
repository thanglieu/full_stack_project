-- CreateTable
CREATE TABLE "tests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tests_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "questions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "testId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "stt" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "questions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "answers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'a',
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_tests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "testId" INTEGER NOT NULL,
    "score" REAL,
    CONSTRAINT "user_tests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_tests_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_answers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userTestId" INTEGER NOT NULL,
    "answerId" INTEGER NOT NULL,
    CONSTRAINT "user_answers_userTestId_fkey" FOREIGN KEY ("userTestId") REFERENCES "user_tests" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_answers_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "answers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_TestTopics" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_TestTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "tests" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TestTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "topics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_tests_userId_testId_key" ON "user_tests"("userId", "testId");

-- CreateIndex
CREATE UNIQUE INDEX "user_answers_userTestId_answerId_key" ON "user_answers"("userTestId", "answerId");

-- CreateIndex
CREATE UNIQUE INDEX "_TestTopics_AB_unique" ON "_TestTopics"("A", "B");

-- CreateIndex
CREATE INDEX "_TestTopics_B_index" ON "_TestTopics"("B");
