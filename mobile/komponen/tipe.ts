// mobile/komponen/tipe.ts
// Tipe data ini digunakan oleh semua file layar (.tsx)

export interface Transaksi {
  id: string;
  tanggal: string; // Tipe string karena datang dari API (ISO format)
  jenis: 'Pemasukan' | 'Pengeluaran';
  jumlah: number;
  deskripsi: string | null;
  createdAt: string;
}

export interface LaporanData {
  bulan: string;
  pemasukan: string; // Angka yang dikembalikan dari queryRaw PostgreSQL adalah string
  pengeluaran: string; // Angka yang dikembalikan dari queryRaw PostgreSQL adalah string
}

// Fungsi pembantu untuk format Rupiah
export const formatRupiah = (angka: number): string => {
  return angka.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};