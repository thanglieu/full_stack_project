-- CreateTable
CREATE TABLE "practices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "practices_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "test_cases" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stt" INTEGER NOT NULL,
    "practiceId" INTEGER NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    CONSTRAINT "test_cases_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "practices" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_practices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "practiceId" INTEGER NOT NULL,
    "mark" INTEGER NOT NULL DEFAULT 0,
    "userCode" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "user_practices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_practices_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "practices" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PracticeTopics" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PracticeTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "practices" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PracticeTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "topics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_practices_userId_practiceId_key" ON "user_practices"("userId", "practiceId");

-- CreateIndex
CREATE UNIQUE INDEX "_PracticeTopics_AB_unique" ON "_PracticeTopics"("A", "B");

-- CreateIndex
CREATE INDEX "_PracticeTopics_B_index" ON "_PracticeTopics"("B");
