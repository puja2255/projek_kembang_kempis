// api/server.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- Rute Transaksi ---

// 1. INPUT (POST) Transaksi Baru
app.post('/transaksi', async (req, res) => {
  const { jenis, jumlah, deskripsi, deskripsiTambahan, tanggal } = req.body;
  try {
    const baru = await prisma.transaksi.create({
      data: {
        jenis,
        jumlah: parseFloat(jumlah),
        deskripsi,
        deskripsiTambahan: deskripsiTambahan || '', // Tambahkan ini
        tanggal: tanggal ? new Date(tanggal) : undefined,
      },
    });
    res.status(201).json(baru);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menambah transaksi' });
  }
});

// 2. GET semua Transaksi
app.get('/transaksi', async (req, res) => {
  try {
    const semua = await prisma.transaksi.findMany({
      orderBy: { tanggal: 'desc' },
    });
    res.json(semua);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data' });
  }
});

// 3. UPDATE (PUT) Transaksi Berdasarkan ID (UNTUK FITUR EDIT)
app.put('/transaksi/:id', async (req, res) => {
  const { id } = req.params;
  const { jenis, jumlah, deskripsi, tanggal } = req.body;

  try {
    const updateData = await prisma.transaksi.update({
      where: { 
        id: id // Karena di schema id adalah String @id
      },
      data: {
        jenis: jenis,
        jumlah: parseFloat(jumlah),
        deskripsi: deskripsi,
        // Pastikan nama field di database 'tanggal' (huruf kecil semua)
        tanggal: tanggal ? new Date(tanggal) : undefined,
      },
    });

    res.json(updateData);
  } catch (error) {
    console.error("EROR PRISMA:", error);
    res.status(500).json({ error: 'Gagal update data di database' });
  }
});

// 4. DELETE Transaksi (UNTUK FITUR HAPUS)
app.delete('/transaksi/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.transaksi.delete({
      where: { id: id },
    });
    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menghapus transaksi' });
  }
});

// 5. GET Laporan
app.get('/laporan', async (req, res) => {
  try {
      const hasil = await prisma.$queryRaw`
          SELECT
              DATE_TRUNC('month', tanggal) AS bulan,
              SUM(CASE WHEN jenis = 'Pemasukan' THEN jumlah ELSE 0 END) AS pemasukan,
              SUM(CASE WHEN jenis = 'Pengeluaran' THEN jumlah ELSE 0 END) AS pengeluaran
          FROM
              "Transaksi"
          GROUP BY
              bulan
          ORDER BY
              bulan DESC;
      `;
      res.json(hasil);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Gagal membuat laporan' });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});