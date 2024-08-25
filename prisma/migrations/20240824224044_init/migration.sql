-- AlterTable
ALTER TABLE "Files" ADD COLUMN     "messageInRoomId" TEXT;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_messageInRoomId_fkey" FOREIGN KEY ("messageInRoomId") REFERENCES "MessageInRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
