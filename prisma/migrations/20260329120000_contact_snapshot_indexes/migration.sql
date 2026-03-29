-- AlterTable
ALTER TABLE "Contact" ADD COLUMN "targetRecipientLabel" TEXT;

-- CreateIndex
CREATE INDEX "Contact_createdAt_idx" ON "Contact"("createdAt");

-- CreateIndex
CREATE INDEX "Contact_targetRecipient_idx" ON "Contact"("targetRecipient");
