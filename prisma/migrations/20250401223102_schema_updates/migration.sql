/*
  Warnings:

  - You are about to drop the column `udpateAt` on the `FriendRequest` table. All the data in the column will be lost.
  - You are about to drop the column `udpateAt` on the `JoinRequest` table. All the data in the column will be lost.
  - You are about to drop the column `udpateAt` on the `UserOnline` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `FriendRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `JoinRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FriendRequest" DROP COLUMN "udpateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "JoinRequest" DROP COLUMN "udpateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserOnline" DROP COLUMN "udpateAt",
ADD COLUMN     "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
