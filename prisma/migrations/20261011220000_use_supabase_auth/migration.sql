ALTER TABLE "User" ADD COLUMN "authUserId" TEXT;

CREATE UNIQUE INDEX "User_authUserId_key" ON "User"("authUserId");

DROP TABLE IF EXISTS "PasswordResetToken" CASCADE;
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";
