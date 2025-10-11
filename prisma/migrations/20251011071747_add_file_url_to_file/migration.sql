/*
  Warnings:

  - You are about to drop the column `encryptionKey` on the `File` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "encryptionKey",
ADD COLUMN     "fileUrl" TEXT;
