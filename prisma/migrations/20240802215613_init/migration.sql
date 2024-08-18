/*
  Warnings:

  - You are about to drop the column `messageId` on the `MessageAttachment` table. All the data in the column will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userId_fkey";

-- DropForeignKey
ALTER TABLE "MessageAttachment" DROP CONSTRAINT "MessageAttachment_messageId_fkey";

-- AlterTable
ALTER TABLE "MessageAttachment" DROP COLUMN "messageId",
ADD COLUMN     "messageInConversationId" TEXT,
ADD COLUMN     "messageInRoomId" TEXT;

-- DropTable
DROP TABLE "Message";

-- CreateTable
CREATE TABLE "MessageInConversation" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "udpateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageInConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageInRoom" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "udpateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageInRoom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MessageInConversation" ADD CONSTRAINT "MessageInConversation_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageInConversation" ADD CONSTRAINT "MessageInConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageInRoom" ADD CONSTRAINT "MessageInRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageInRoom" ADD CONSTRAINT "MessageInRoom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageInConversationId_fkey" FOREIGN KEY ("messageInConversationId") REFERENCES "MessageInConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageInRoomId_fkey" FOREIGN KEY ("messageInRoomId") REFERENCES "MessageInRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
