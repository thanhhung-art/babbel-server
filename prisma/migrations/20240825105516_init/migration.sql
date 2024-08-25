-- AlterTable
ALTER TABLE "Files" ADD COLUMN     "messageInConversationId" TEXT;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_messageInConversationId_fkey" FOREIGN KEY ("messageInConversationId") REFERENCES "MessageInConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
