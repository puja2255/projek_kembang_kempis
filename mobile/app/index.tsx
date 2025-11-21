// mobile/app/index.tsx

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import Kartu from '../komponen/Kartu'; 
import { useFocusEffect, useRouter } from 'expo-router';
import { Transaksi, formatRupiah } from '../komponen/tipe'; // Import Tipe dan fungsi pembantu
import { MaterialCommunityIcons } from '@expo/vector-icons';

// *** GANTI DENGAN IP LOKAL KOMPUTER ANDA ***
const API_URL: string = 'http://192.168.1.10:3000'; 

const Home: React.FC = () => {
  const router = useRouter(); 
  const [data, setData] = useState<Transaksi[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const ambilData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/transaksi`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json: Transaksi[] = await response.json(); 
      // Jika API mengembalikan kosong, gunakan mock lokal agar tampilan tetap terlihat
      setData(Array.isArray(json) && json.length > 0 ? json : MOCK_DATA);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      Alert.alert('Koneksi Gagal', 'Pastikan server backend berjalan dan IP Address sudah benar.');
      // Jika fetch gagal, gunakan mock data agar UI dapat diuji tanpa backend
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

  // MOCK_DATA: gunakan hanya jika API mengembalikan array kosong atau fetch gagal
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

  // Hitung total saldo
  const saldo: number = data.reduce((acc, trans) => {
    return trans.jenis === 'Pemasukan' ? acc + trans.jumlah : acc - trans.jumlah;
  }, 0);

  const onRefresh = () => {
    setRefreshing(true);
    ambilData();
  };


  return (
    <View style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo Saat Ini</Text>
        <Text style={[styles.balanceValue, { color: saldo >= 0 ? '#27ae60' : '#e74c3c' }]}>Rp {formatRupiah(saldo)}</Text>
      </View>

      <View style={styles.tombolContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/inputan')}>
          <Text style={styles.primaryButtonText}>Tambah Transaksi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/laporan')}>
          <Text style={styles.secondaryButtonText}>Lihat Laporan</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.judulList}>Daftar Transaksi</Text>
      
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }}/>
      ) : (
        <ScrollView 
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {data.length > 0 ? (
            data.map((item: Transaksi) => (
              <Kartu key={item.id} transaksi={item} /> 
            ))
          ) : (
            <Text style={styles.emptyText}>Belum ada transaksi. Tarik ke bawah untuk refresh.</Text>
          )}
        </ScrollView>
      )}
      
      {/* FAB: floating add button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/inputan')}>
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f5f7fb' },
  balanceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  balanceLabel: { fontSize: 14, color: '#777' },
  balanceValue: { fontSize: 26, fontWeight: '700', marginTop: 6 },
  tombolContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
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
    backgroundColor: '#fff',
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6e9ee',
  },
  secondaryButtonText: { color: '#333', fontWeight: '700' },
  judulList: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  list: { flex: 1 },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#666' }
  ,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  }
});

export default Home;