-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "primaryMobile" TEXT NOT NULL,
    "secondaryMobile" TEXT,
    "aadhar" TEXT NOT NULL,
    "aadharHash" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "panHash" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "placeOfBirth" TEXT NOT NULL,
    "currentAddress" TEXT NOT NULL,
    "permanentAddress" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_primaryMobile_key" ON "User"("primaryMobile");

-- CreateIndex
CREATE UNIQUE INDEX "User_aadhar_key" ON "User"("aadhar");

-- CreateIndex
CREATE UNIQUE INDEX "User_aadharHash_key" ON "User"("aadharHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_pan_key" ON "User"("pan");

-- CreateIndex
CREATE UNIQUE INDEX "User_panHash_key" ON "User"("panHash");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

-- CreateIndex
CREATE INDEX "User_primaryMobile_idx" ON "User"("primaryMobile");
