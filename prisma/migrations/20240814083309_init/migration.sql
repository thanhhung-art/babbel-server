/*
  Warnings:

  - Added the required column `messageAttcachmentId` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `messageAttcachmentId` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `messageAttcachmentId` to the `videos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" ADD COLUMN     "messageAttcachmentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "images" ADD COLUMN     "messageAttcachmentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "messageAttcachmentId" TEXT NOT NULL;
