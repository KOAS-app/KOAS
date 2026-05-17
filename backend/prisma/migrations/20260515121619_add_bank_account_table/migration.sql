/*
  Warnings:

  - You are about to drop the column `accountHolderName` on the `Stadium` table. All the data in the column will be lost.
  - You are about to drop the column `accountNumber` on the `Stadium` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `Stadium` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stadium" DROP COLUMN "accountHolderName",
DROP COLUMN "accountNumber",
DROP COLUMN "bankName";

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "stadiumId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BankAccount_stadiumId_idx" ON "BankAccount"("stadiumId");

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id") ON DELETE CASCADE ON UPDATE CASCADE;
