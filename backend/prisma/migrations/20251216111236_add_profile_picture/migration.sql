-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assignedToId_fkey";

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "assignedToId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePicture" TEXT;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
