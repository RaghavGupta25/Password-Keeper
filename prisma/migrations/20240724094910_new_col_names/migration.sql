/*
  Warnings:

  - The primary key for the `Cards` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `c_id` on the `Cards` table. All the data in the column will be lost.
  - The primary key for the `Passwords` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Website` on the `Passwords` table. All the data in the column will be lost.
  - You are about to drop the column `p_id` on the `Passwords` table. All the data in the column will be lost.
  - You are about to drop the column `p_password` on the `Passwords` table. All the data in the column will be lost.
  - You are about to drop the column `p_username` on the `Passwords` table. All the data in the column will be lost.
  - Added the required column `bank` to the `Cards` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Cards` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `Passwords` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `password` to the `Passwords` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Passwords` table without a default value. This is not possible if the table is not empty.
  - Added the required column `website` to the `Passwords` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cards" DROP CONSTRAINT "Cards_pkey",
DROP COLUMN "c_id",
ADD COLUMN     "bank" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Cards_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Passwords" DROP CONSTRAINT "Passwords_pkey",
DROP COLUMN "Website",
DROP COLUMN "p_id",
DROP COLUMN "p_password",
DROP COLUMN "p_username",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL,
ADD COLUMN     "website" TEXT NOT NULL,
ADD CONSTRAINT "Passwords_pkey" PRIMARY KEY ("id");
