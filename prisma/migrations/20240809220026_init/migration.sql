/*
  Warnings:

  - A unique constraint covering the columns `[roomId]` on the table `Chating` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[conversationId]` on the table `Chating` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chating_roomId_key" ON "Chating"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "Chating_conversationId_key" ON "Chating"("conversationId");
