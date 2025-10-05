/*
  Warnings:

  - You are about to drop the column `balance` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `limit` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `Card` table. All the data in the column will be lost.
  - The `bankName` column on the `Card` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cardType` column on the `Card` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cardBank` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idempotencyKey` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `redirectUrl` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reminderDate` to the `Reminder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessToken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenexpiry` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BankName" AS ENUM ('Barclays', 'Lloyds', 'Monzo', 'CapitalOne');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('MasterCard', 'Visa', 'Discover', 'AmericanExpress');

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "balance",
DROP COLUMN "limit",
DROP COLUMN "number",
ADD COLUMN     "accountId" TEXT,
ADD COLUMN     "availableBalance" DOUBLE PRECISION,
ADD COLUMN     "cardNetwork" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creditLimit" DOUBLE PRECISION,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "dueAmount" DOUBLE PRECISION,
ADD COLUMN     "lastFour" TEXT,
ADD COLUMN     "lastStatementBalance" DOUBLE PRECISION,
ADD COLUMN     "lastStatementDate" TIMESTAMP(3),
ADD COLUMN     "maskedNumber" TEXT,
ADD COLUMN     "nameOnCard" TEXT,
ADD COLUMN     "paymentDueDate" TIMESTAMP(3),
ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validFrom" TIMESTAMP(3),
ADD COLUMN     "validTo" TIMESTAMP(3),
DROP COLUMN "bankName",
ADD COLUMN     "bankName" "BankName",
DROP COLUMN "cardType",
ADD COLUMN     "cardType" "CardType",
ALTER COLUMN "dueDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "cardBank" "BankName" NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "idempotencyKey" TEXT NOT NULL,
ADD COLUMN     "redirectUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "notifyVia" TEXT[],
ADD COLUMN     "reminderDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessToken" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT NOT NULL,
ADD COLUMN     "tokenexpiry" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "UserInfo" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "mobilenumber" TEXT NOT NULL,

    CONSTRAINT "UserInfo_pkey" PRIMARY KEY ("id")
);
