-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TOUR_GUIDE', 'TOURIST');

-- DropIndex
DROP INDEX "users_email_idx";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "firebase_uid" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'TOURIST',
ALTER COLUMN "phone_number" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");

-- CreateIndex
CREATE INDEX "users_email_phone_number_full_name_idx" ON "users"("email", "phone_number", "full_name");

-- CreateIndex
CREATE INDEX "users_firebase_uid_idx" ON "users"("firebase_uid");
