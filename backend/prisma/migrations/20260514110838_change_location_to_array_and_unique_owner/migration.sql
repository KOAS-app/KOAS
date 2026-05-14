/*
  Warnings:

  - You are about to drop the column `location` on the `Stadium` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerId]` on the table `Stadium` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Stadium" DROP COLUMN "location",
ADD COLUMN     "locations" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Stadium_ownerId_key" ON "Stadium"("ownerId");
