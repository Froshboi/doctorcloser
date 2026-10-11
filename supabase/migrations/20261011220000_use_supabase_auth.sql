ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS "authUserId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_authUserId_key"
ON public."User"("authUserId");

DROP TABLE IF EXISTS public."PasswordResetToken" CASCADE;
ALTER TABLE public."User" DROP COLUMN IF EXISTS "passwordHash";
