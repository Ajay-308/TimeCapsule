-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionPlan" TEXT,
    "subscriptionStatus" TEXT,
    "subscriptionBilling" TEXT,
    "subscriptionStartDate" TIMESTAMP(3),
    "subscriptionEndDate" TIMESTAMP(3),
    "subscriptionCancelledAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentId" TEXT,
    "signature" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "billing" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capsule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "fileId" TEXT,
    "encryptionKey" TEXT NOT NULL,
    "unlockDate" TIMESTAMP(3) NOT NULL,
    "location" JSONB,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "isOneTimeAccess" BOOLEAN NOT NULL,
    "isAccessed" BOOLEAN NOT NULL DEFAULT false,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "maxAccess" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlockedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),

    CONSTRAINT "Capsule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborativeCapsule" (
    "id" TEXT NOT NULL,
    "mainCapsuleId" TEXT NOT NULL,
    "collaboratorUserId" TEXT NOT NULL,
    "contribution" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canView" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CollaborativeCapsule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "capsuleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicWall" (
    "id" TEXT NOT NULL,
    "capsuleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isModerated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PublicWall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "capsuleId" TEXT,
    "storageId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "encryptionKey" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_orderId_idx" ON "Order"("orderId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Capsule_userId_idx" ON "Capsule"("userId");

-- CreateIndex
CREATE INDEX "Capsule_unlockDate_idx" ON "Capsule"("unlockDate");

-- CreateIndex
CREATE INDEX "Capsule_isUnlocked_idx" ON "Capsule"("isUnlocked");

-- CreateIndex
CREATE INDEX "Capsule_isPublic_isUnlocked_idx" ON "Capsule"("isPublic", "isUnlocked");

-- CreateIndex
CREATE INDEX "CollaborativeCapsule_mainCapsuleId_idx" ON "CollaborativeCapsule"("mainCapsuleId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_sent_idx" ON "Notification"("sent");

-- CreateIndex
CREATE UNIQUE INDEX "PublicWall_capsuleId_key" ON "PublicWall"("capsuleId");

-- CreateIndex
CREATE INDEX "PublicWall_unlockedAt_idx" ON "PublicWall"("unlockedAt");

-- CreateIndex
CREATE INDEX "PublicWall_isModerated_idx" ON "PublicWall"("isModerated");

-- CreateIndex
CREATE INDEX "File_uploadedBy_idx" ON "File"("uploadedBy");

-- CreateIndex
CREATE INDEX "File_capsuleId_idx" ON "File"("capsuleId");

-- AddForeignKey
ALTER TABLE "Capsule" ADD CONSTRAINT "Capsule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborativeCapsule" ADD CONSTRAINT "CollaborativeCapsule_mainCapsuleId_fkey" FOREIGN KEY ("mainCapsuleId") REFERENCES "Capsule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborativeCapsule" ADD CONSTRAINT "CollaborativeCapsule_collaboratorUserId_fkey" FOREIGN KEY ("collaboratorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicWall" ADD CONSTRAINT "PublicWall_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicWall" ADD CONSTRAINT "PublicWall_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
