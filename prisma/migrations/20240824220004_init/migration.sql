/*
  Warnings:

  - You are about to drop the column `fileId` on the `MessageAttachment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Files" DROP CONSTRAINT "Files_messageAttachmentId_fkey";

-- AlterTable
ALTER TABLE "Files" ALTER COLUMN "messageAttachmentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MessageAttachment" DROP COLUMN "fileId";

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_messageAttachmentId_fkey" FOREIGN KEY ("messageAttachmentId") REFERENCES "MessageAttachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
