/*
  Warnings:

  - You are about to drop the `RevokedToken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `confirmPassword` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "confirmPassword" TEXT NOT NULL;

-- DropTable
DROP TABLE "RevokedToken";

-- CreateTable
CREATE TABLE "Passwords" (
    "p_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "p_username" TEXT NOT NULL,
    "p_password" TEXT NOT NULL,
    "Website" TEXT NOT NULL,

    CONSTRAINT "Passwords_pkey" PRIMARY KEY ("p_id")
);

-- CreateTable
CREATE TABLE "Cards" (
    "c_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardNumber" INTEGER NOT NULL,
    "cvv" INTEGER NOT NULL,
    "cardHolder" TEXT NOT NULL,
    "expiry" TEXT NOT NULL,

    CONSTRAINT "Cards_pkey" PRIMARY KEY ("c_id")
);

-- AddForeignKey
ALTER TABLE "Passwords" ADD CONSTRAINT "Passwords_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cards" ADD CONSTRAINT "Cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
