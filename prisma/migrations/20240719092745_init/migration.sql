/*
  Warnings:

  - Added the required column `role` to the `RoomMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RoomMember" ADD COLUMN     "role" TEXT NOT NULL;
