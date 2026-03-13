-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'GUEST';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'GUEST';
