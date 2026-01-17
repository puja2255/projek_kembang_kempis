import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatRupiah } from './tipe';
import { useTheme } from './ThemeContext';

export type Transaction = {
  id: string; // Tambahkan ID untuk keperluan hapus data
  jenis: string;
  tanggal: string;
  jumlah: number;
  deskripsi?: string | null;
  deskripsiTambahan?: string | null;
};

// Menambahkan props 'onDelete' agar bisa dipanggil dari Home
interface KartuProps {
  transaksi: Transaction;
  onDelete: () => void; 
}

const Kartu: React.FC<KartuProps> = ({ transaksi, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const isPemasukan = transaksi.jenis === 'Pemasukan';
  const scale = useRef(new Animated.Value(1)).current;

  // Mengambil status tema (Dark/Light)
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Animasi saat kartu ditekan (Efek mengecil sedikit)
  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, speed: 20 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  // Formatting Tanggal dan Waktu dari string ISO
  const tanggal = new Date(transaksi.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  const waktu = new Date(transaksi.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)} // Toggle untuk melihat deskripsi tambahan
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{ marginVertical: 6 }}
    >
      <Animated.View
        style={[
          styles.kartu,
          {
            transform: [{ scale }],
            backgroundColor: isDark ? '#1E1E1E' : '#fff', // Latar belakang adaptif terhadap dark mode
          },
        ]}
      >
        {/* 1. Icon Indikator (Kiri) */}
        <View style={styles.left}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: isPemasukan
                  ? (isDark ? '#163d2c' : '#eaf8f0') // Hijau untuk pemasukan
                  : (isDark ? '#3d1a1a' : '#fff2f1'), // Merah untuk pengeluaran
              },
            ]}
          >
            <MaterialCommunityIcons
              name={isPemasukan ? 'arrow-up-bold' : 'arrow-down-bold'}
              size={20}
              color={isPemasukan ? '#16a085' : '#c0392b'}
            />
          </View>
        </View>

        {/* 2. Detail Informasi (Tengah) */}
        <View style={styles.detail}>
          <Text style={[styles.deskripsi, { color: isDark ? '#fff' : '#222' }]}>
            {transaksi.deskripsi || '-'}
          </Text>
          
          {/* Muncul hanya jika kartu di-klik (Expanded) */}
          {transaksi.deskripsiTambahan && expanded && (
            <Text style={[styles.deskripsiTambahan, { color: isDark ? '#ccc' : '#555' }]}>
              {transaksi.deskripsiTambahan}
            </Text>
          )}

          <View style={styles.dateRow}>
            <Text style={[styles.tanggal, { color: isDark ? '#aaa' : '#666' }]}>{tanggal}</Text>
            <View
              style={[
                styles.timeBadge,
                { backgroundColor: isDark ? '#333' : '#f1f4f8' },
              ]}
            >
              <Text style={[styles.timeText, { color: isDark ? '#ddd' : '#6b7280' }]}>{waktu}</Text>
            </View>
          </View>
        </View>

        {/* 3. Jumlah & Aksi Hapus (Kanan) */}
        <View style={styles.right}>
          {/* Badge Jumlah Uang */}
          <View
            style={[
              styles.amountWrap,
              {
                backgroundColor: isPemasukan
                  ? (isDark ? '#163d2c' : '#ecf9f3')
                  : (isDark ? '#3d1a1a' : '#fff5f5'),
              },
            ]}
          >
            <Text style={[styles.jumlah, { color: isPemasukan ? '#0e7a53' : '#a72e2e' }]}>
              {isPemasukan ? '+' : '-'} {formatRupiah(transaksi.jumlah)}
            </Text>
          </View>

          {/* ⬅️ FITUR BARU: Tombol Hapus (Muncul hanya saat kartu di-expand) */}
          {expanded && (
            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={onDelete} // Memanggil fungsi hapus dari parent (Home)
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={20} color="#e74c3c" />
              <Text style={styles.deleteText}>Hapus</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  kartu: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  left: { width: 40, alignItems: 'center' },
  detail: { flex: 1, paddingHorizontal: 8 },
  deskripsi: { fontSize: 16, fontWeight: '600' },
  deskripsiTambahan: { fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  timeBadge: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  timeText: { fontSize: 11 },
  tanggal: { fontSize: 12 },
  jumlah: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  right: { minWidth: 110, alignItems: 'flex-end' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  amountWrap: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16 },
  // Style tombol hapus
  deleteBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10, 
    padding: 5,
    backgroundColor: 'rgba(231, 76, 60, 0.1)', 
    borderRadius: 8 
  },
  deleteText: { color: '#e74c3c', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
});

export default Kartu;