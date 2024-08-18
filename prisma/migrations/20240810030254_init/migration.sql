/*
  Warnings:

  - You are about to drop the `Chating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Chating" DROP CONSTRAINT "Chating_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Chating" DROP CONSTRAINT "Chating_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Chating" DROP CONSTRAINT "Chating_userId_fkey";

-- DropTable
DROP TABLE "Chating";

-- CreateTable
CREATE TABLE "Chatting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT,
    "conversationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "udpateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chatting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chatting" ADD CONSTRAINT "Chatting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatting" ADD CONSTRAINT "Chatting_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatting" ADD CONSTRAINT "Chatting_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
