-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allowCollaborations" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pushNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showOnPublicWall" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "theme" TEXT DEFAULT 'system';
