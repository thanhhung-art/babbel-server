-- CreateTable
CREATE TABLE "Chating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT,
    "conversationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "udpateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chating_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chating" ADD CONSTRAINT "Chating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chating" ADD CONSTRAINT "Chating_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chating" ADD CONSTRAINT "Chating_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
