import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatRupiah } from './tipe';
import { useTheme } from './ThemeContext';   // ⬅️ ambil theme dari context

export type Transaction = {
  id: string;             // ID unik untuk keperluan edit & hapus
  jenis: string;
  tanggal: string;
  jumlah: number;
  deskripsi?: string | null;
  deskripsiTambahan?: string | null;
};

// Interface props untuk menerima fungsi edit dan hapus dari parent
interface KartuProps {
  transaksi: Transaction;
  onDelete: () => void;
  onEdit: () => void;
}

const Kartu: React.FC<KartuProps> = ({ transaksi, onDelete, onEdit }) => {
  // State untuk expand/collapse deskripsi tambahan
  const [expanded, setExpanded] = useState(false);
  const isPemasukan = transaksi.jenis === 'Pemasukan';
  
  // Ref untuk animasi scale saat ditekan
  const scale = useRef(new Animated.Value(1)).current;

  // Context tema (Dark/Light)
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // --- Animasi Feedback Tekanan ---
  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, speed: 20 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  // --- Format Waktu & Tanggal ---
  const tanggal = new Date(transaksi.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  const waktu = new Date(transaksi.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{ marginVertical: 6 }}
    >
      <Animated.View
        style={[
          styles.kartu,
          {
            transform: [{ scale }],
            backgroundColor: isDark ? '#1E1E1E' : '#fff',   // Kartu adaptif tema
          },
        ]}
      >
        {/* Kolon Kiri: Ikon Panah (Indikator Jenis) */}
        <View style={styles.left}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: isPemasukan
                  ? isDark ? '#163d2c' : '#eaf8f0'
                  : isDark ? '#3d1a1a' : '#fff2f1',
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

        {/* Kolom Tengah: Deskripsi dan Tanggal */}
        <View style={styles.detail}>
          <Text style={[styles.deskripsi, { color: isDark ? '#fff' : '#222' }]}>
            {transaksi.deskripsi || '-'}
          </Text>
          
          {/* Deskripsi Tambahan: Muncul hanya jika expanded = true */}
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

        {/* Kolom Kanan: Jumlah Uang & Tombol Aksi */}
        <View style={styles.right}>
          <View
            style={[
              styles.amountWrap,
              {
                backgroundColor: isPemasukan
                  ? isDark ? '#163d2c' : '#ecf9f3'
                  : isDark ? '#3d1a1a' : '#fff5f5',
              },
            ]}
          >
            <Text style={[styles.jumlah, { color: isPemasukan ? '#0e7a53' : '#a72e2e' }]}>
              {isPemasukan ? '+' : '-'} {formatRupiah(transaksi.jumlah)}
            </Text>
          </View>

          {/* Tombol EDIT & HAPUS: Muncul saat kartu dibuka (expanded) */}
          {expanded && (
            <View style={styles.actionRow}>
              {/* Tombol Edit */}
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: isDark ? '#1a2e3b' : '#e1f0f7' }]} 
                onPress={onEdit}
              >
                <MaterialCommunityIcons name="pencil-outline" size={18} color="#2d9cdb" />
              </TouchableOpacity>

              {/* Tombol Hapus */}
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: isDark ? '#3d1a1a' : '#fff0f0' }]} 
                onPress={onDelete}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#e74c3c" />
              </TouchableOpacity>
            </View>
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
  // Gaya untuk tombol aksi baru
  actionRow: { 
    flexDirection: 'row', 
    marginTop: 10, 
    gap: 8 
  },
  actionBtn: { 
    padding: 6, 
    borderRadius: 8, 
    borderWidth: 0.5, 
    borderColor: 'rgba(0,0,0,0.05)' 
  },
});

export default Kartu;