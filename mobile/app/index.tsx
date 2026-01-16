import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Kartu from '../komponen/Kartu';
import { useTheme } from '../komponen/ThemeContext';

import { Transaksi, formatRupiah } from '../komponen/tipe';
import { on as busOn } from '../komponen/eventBus';

import { API_URL } from '../config';

const Home: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();

  const [data, setData] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(''); 
  
  // State baru untuk filter jenis
  const [filterJenis, setFilterJenis] = useState<'Semua' | 'Pemasukan' | 'Pengeluaran'>('Semua');

  const ambilData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/transaksi`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json: Transaksi[] = await response.json();
      setData(Array.isArray(json) && json.length > 0 ? json : MOCK_DATA);
    } catch (error) {
      console.error('Gagal mengambil data:', error);
      Alert.alert(
        'Koneksi Gagal',
        'Pastikan server backend berjalan dan IP Address sudah benar.'
      );
      setData(MOCK_DATA);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      ambilData();
      return () => {};
    }, [])
  );

  useEffect(() => {
    const unsub = busOn('transaksi:created', (item: Transaksi) => {
      if (!item) return;
      setData((prev) => [item, ...prev]);
    });
    return () => unsub();
  }, []);

  const MOCK_DATA: Transaksi[] = [
    {
      id: 'mock-1',
      jenis: 'Pemasukan',
      jumlah: 150000,
      tanggal: new Date().toISOString(),
      deskripsi: 'Mock: Gaji bulanan',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mock-2',
      jenis: 'Pengeluaran',
      jumlah: 45000,
      tanggal: new Date().toISOString(),
      deskripsi: 'Mock: Makan siang',
      createdAt: new Date().toISOString(),
    },
  ];

  const saldo: number = data.reduce((acc, trans) => {
    return trans.jenis === 'Pemasukan'
      ? acc + trans.jumlah
      : acc - trans.jumlah;
  }, 0);

  const onRefresh = () => {
    setRefreshing(true);
    ambilData();
  };

  const isDark = theme === 'dark';

  // Logika filter (Gabungan search dan kategori jenis)
  const filteredData = data.filter((item) => {
    const matchesSearch = (item.deskripsi || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJenis = filterJenis === 'Semua' || item.jenis === filterJenis;
    return matchesSearch && matchesJenis;
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#F5F7FB' },
      ]}
    >
      {/* Saldo */}
      <View
        style={[
          styles.balanceCard,
          { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
        ]}
      >
        <Text
          style={[
            styles.balanceLabel,
            { color: isDark ? '#AAAAAA' : '#777' },
          ]}
        >
          Saldo Saat Ini
        </Text>
        <Text
          style={[
            styles.balanceValue,
            { color: saldo >= 0 ? '#27ae60' : '#e74c3c' },
          ]}
        >
          Rp {formatRupiah(saldo)}
        </Text>
      </View>

      {/* Tombol Utama (Tetap Dipertahankan) */}
      <View style={styles.tombolContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/inputan')}
        >
          <Text style={styles.primaryButtonText}>Tambah Transaksi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
              borderColor: isDark ? '#333' : '#e6e9ee',
            },
          ]}
          onPress={() => router.push('/laporan')}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              { color: isDark ? '#FFFFFF' : '#333' },
            ]}
          >
            Lihat Laporan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TextInput
        style={[
          styles.searchBar,
          {
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            color: isDark ? '#FFFFFF' : '#000000',
            borderColor: isDark ? '#333' : '#ccc',
          },
        ]}
        placeholder="Cari transaksi..."
        placeholderTextColor={isDark ? '#888' : '#999'}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Tambahan Filter Kategori (Chips) */}
      <View style={styles.filterContainer}>
        {(['Semua', 'Pemasukan', 'Pengeluaran'] as const).map((tipe) => (
          <TouchableOpacity
            key={tipe}
            onPress={() => setFilterJenis(tipe)}
            style={[
              styles.filterChip,
              filterJenis === tipe && styles.filterChipActive,
              { backgroundColor: filterJenis === tipe ? '#2d9cdb' : (isDark ? '#1E1E1E' : '#fff') }
            ]}
          >
            <Text style={[
              styles.filterChipText,
              { color: filterJenis === tipe ? '#fff' : (isDark ? '#aaa' : '#666') }
            ]}>
              {tipe}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text
        style={[
          styles.judulList,
          { color: isDark ? '#FFFFFF' : '#000000' },
        ]}
      >
        Daftar Transaksi
      </Text>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2d9cdb" />
      ) : (
        <ScrollView
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Kartu key={item.id} transaksi={item} />
            ))
          ) : (
            <Text
              style={[
                styles.emptyText,
                { color: isDark ? '#AAAAAA' : '#666' },
              ]}
            >
              Tidak ada transaksi yang cocok.
            </Text>
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/inputan')}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  balanceCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
    elevation: 3,
  },
  balanceLabel: { fontSize: 14 },
  balanceValue: { fontSize: 26, fontWeight: '700', marginTop: 6 },
  tombolContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2d9cdb',
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: { fontWeight: '700' },
  searchBar: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  // Filter Chips Styles
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    borderColor: '#2d9cdb',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  judulList: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  list: { flex: 1 },
  emptyText: { textAlign: 'center', marginTop: 30 },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2d9cdb',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});

export default Home;