/*
  Warnings:

  - You are about to drop the column `messageAttcachmentId` on the `Files` table. All the data in the column will be lost.
  - Added the required column `messageAttachmentId` to the `Files` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Files" DROP CONSTRAINT "Files_messageAttcachmentId_fkey";

-- AlterTable
ALTER TABLE "Files" DROP COLUMN "messageAttcachmentId",
ADD COLUMN     "messageAttachmentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_messageAttachmentId_fkey" FOREIGN KEY ("messageAttachmentId") REFERENCES "MessageAttachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
