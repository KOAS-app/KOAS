-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "stadiumId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_stadiumId_idx" ON "Review"("stadiumId");

-- CreateIndex
CREATE INDEX "Review_playerId_idx" ON "Review"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_stadiumId_playerId_key" ON "Review"("stadiumId", "playerId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
