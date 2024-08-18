/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Chating` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Chating_conversationId_key";

-- DropIndex
DROP INDEX "Chating_roomId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Chating_userId_key" ON "Chating"("userId");
