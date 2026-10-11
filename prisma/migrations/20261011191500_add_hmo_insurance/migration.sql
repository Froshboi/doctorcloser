-- CreateEnum
CREATE TYPE "HmoPolicyStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "HmoAuthorizationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "hmoPolicyId" TEXT;

-- CreateTable
CREATE TABLE "HmoProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "supportUrl" TEXT,
    "verificationEndpoint" TEXT,
    "authorizationEndpoint" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HmoProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HmoPolicy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "planTier" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "HmoPolicyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HmoPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HmoAuthorizationRequest" (
    "id" TEXT NOT NULL,
    "requestReference" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "hmoPolicyId" TEXT NOT NULL,
    "diagnosisSummary" TEXT NOT NULL,
    "status" "HmoAuthorizationStatus" NOT NULL DEFAULT 'PENDING',
    "authorizationCode" TEXT,
    "responseDetails" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HmoAuthorizationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HmoProvider_code_key" ON "HmoProvider"("code");

-- CreateIndex
CREATE INDEX "HmoProvider_isActive_idx" ON "HmoProvider"("isActive");

-- CreateIndex
CREATE INDEX "HmoPolicy_userId_status_idx" ON "HmoPolicy"("userId", "status");

-- CreateIndex
CREATE INDEX "HmoPolicy_expiresAt_idx" ON "HmoPolicy"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "HmoPolicy_providerId_policyNumber_key" ON "HmoPolicy"("providerId", "policyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "HmoAuthorizationRequest_requestReference_key" ON "HmoAuthorizationRequest"("requestReference");

-- CreateIndex
CREATE UNIQUE INDEX "HmoAuthorizationRequest_authorizationCode_key" ON "HmoAuthorizationRequest"("authorizationCode");

-- CreateIndex
CREATE INDEX "HmoAuthorizationRequest_appointmentId_submittedAt_idx" ON "HmoAuthorizationRequest"("appointmentId", "submittedAt");

-- CreateIndex
CREATE INDEX "HmoAuthorizationRequest_hmoPolicyId_status_idx" ON "HmoAuthorizationRequest"("hmoPolicyId", "status");

-- CreateIndex
CREATE INDEX "Appointment_hmoPolicyId_idx" ON "Appointment"("hmoPolicyId");

-- CreateIndex
CREATE INDEX "Appointment_userId_createdAt_idx" ON "Appointment"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_hmoPolicyId_fkey" FOREIGN KEY ("hmoPolicyId") REFERENCES "HmoPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HmoPolicy" ADD CONSTRAINT "HmoPolicy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HmoPolicy" ADD CONSTRAINT "HmoPolicy_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "HmoProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HmoAuthorizationRequest" ADD CONSTRAINT "HmoAuthorizationRequest_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HmoAuthorizationRequest" ADD CONSTRAINT "HmoAuthorizationRequest_hmoPolicyId_fkey" FOREIGN KEY ("hmoPolicyId") REFERENCES "HmoPolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
