-- CreateTable
CREATE TABLE "UserOnline" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "socketId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "udpateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserOnline_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserOnline" ADD CONSTRAINT "UserOnline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
