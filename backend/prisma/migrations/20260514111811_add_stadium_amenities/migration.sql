-- AlterTable
ALTER TABLE "Stadium" ADD COLUMN     "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[];
