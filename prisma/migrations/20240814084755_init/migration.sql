/*
  Warnings:

  - You are about to drop the column `filesId` on the `MessageAttachment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MessageAttachment" DROP CONSTRAINT "MessageAttachment_filesId_fkey";

-- AlterTable
ALTER TABLE "MessageAttachment" DROP COLUMN "filesId",
ADD COLUMN     "fileId" TEXT;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
