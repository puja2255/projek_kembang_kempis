-- CreateTable
CREATE TABLE "Transaksi" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jenis" TEXT NOT NULL,
    "jumlah" DOUBLE PRECISION NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);
