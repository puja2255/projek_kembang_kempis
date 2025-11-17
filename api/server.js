// api/server.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config(); // Untuk memuat .env

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(cors()); // Izinkan aplikasi React Native mengakses API
app.use(express.json()); // Izinkan server membaca body JSON

// --- Rute Transaksi ---

// 1. INPUT (POST) Transaksi Baru
app.post('/transaksi', async (req, res) => {
  const { jenis, jumlah, deskripsi, tanggal } = req.body;
  try {
    const baru = await prisma.transaksi.create({
      data: {
        jenis,
        jumlah: parseFloat(jumlah), // Pastikan jumlah adalah angka
        deskripsi,
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
      orderBy: {
        tanggal: 'desc',
      },
    });
    res.json(semua);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data transaksi' });
  }
});

// 3. GET Laporan/Grafis (Contoh Sederhana: Total Pemasukan/Pengeluaran Bulanan)
app.get('/laporan', async (req, res) => {
  // Ini adalah bagian kompleks. Untuk pemula, kita sediakan data mentah dulu.
  // Analisis data akan lebih mudah dilakukan di sisi client (React Native).
  // Namun, jika ingin di backend:
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