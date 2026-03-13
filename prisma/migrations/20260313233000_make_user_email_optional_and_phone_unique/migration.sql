-- DropIndex
DROP INDEX "users_email_phone_number_full_name_idx";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "users_full_name_idx" ON "users"("full_name");
