-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "organization" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "privacyAccepted" BOOLEAN NOT NULL,
    "targetRecipient" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mandant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mandant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Einrichtung" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mandantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Einrichtung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fachabteilung" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "einrichtungId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fachabteilung_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Einrichtung" ADD CONSTRAINT "Einrichtung_mandantId_fkey" FOREIGN KEY ("mandantId") REFERENCES "Mandant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fachabteilung" ADD CONSTRAINT "Fachabteilung_einrichtungId_fkey" FOREIGN KEY ("einrichtungId") REFERENCES "Einrichtung"("id") ON DELETE CASCADE ON UPDATE CASCADE;
