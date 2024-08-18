/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `UserOnline` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserOnline_userId_key" ON "UserOnline"("userId");
