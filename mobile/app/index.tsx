// mobile/app/index.tsx

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import Kartu from '../komponen/Kartu'; 
import { useFocusEffect, useRouter } from 'expo-router';
import { Transaksi, formatRupiah } from '../komponen/tipe'; // Import Tipe dan fungsi pembantu

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
      setData(json);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      Alert.alert('Koneksi Gagal', 'Pastikan server backend berjalan dan IP Address sudah benar.');
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
      <Text style={styles.saldo}>Saldo Saat Ini:</Text>
      <Text style={[styles.saldo, { color: saldo >= 0 ? 'green' : 'red' }]}>
        Rp {formatRupiah(saldo)}
      </Text>

      <View style={styles.tombolContainer}>
        <Button 
          title="Tambah Transaksi" 
          onPress={() => router.push('inputan')}
        />
        <Button 
          title="Lihat Laporan" 
          onPress={() => router.push('laporan')}
        />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  saldo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  tombolContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 15 },
  judulList: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  list: { flex: 1 },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#666' }
});

export default Home;