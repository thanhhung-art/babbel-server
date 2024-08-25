/*
  Warnings:

  - A unique constraint covering the columns `[messageInConversationId]` on the table `MessageAttachment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[messageInRoomId]` on the table `MessageAttachment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[messageAttachmentId]` on the table `MessageInRoom` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `messageAttachmentId` to the `MessageInRoom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MessageInRoom" ADD COLUMN     "messageAttachmentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MessageAttachment_messageInConversationId_key" ON "MessageAttachment"("messageInConversationId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageAttachment_messageInRoomId_key" ON "MessageAttachment"("messageInRoomId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageInRoom_messageAttachmentId_key" ON "MessageInRoom"("messageAttachmentId");
