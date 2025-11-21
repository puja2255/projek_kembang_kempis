// mobile/layar/Laporan.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

// *** GANTI DENGAN IP LOKAL KOMPUTER ANDA ***
const API_URL = 'http://192.168.1.10:3000'; 
const screenWidth = Dimensions.get('window').width;

const Laporan = () => {
  const [dataLaporan, setDataLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

  const ambilLaporan = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/laporan`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      setDataLaporan(json);
    } catch (error) {
      console.error("Gagal mengambil laporan:", error);
      Alert.alert('Koneksi Gagal', 'Gagal memuat data laporan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ambilLaporan();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  // --- Persiapan Data untuk Bar Chart ---
  
  // Ambil 6 data bulanan terakhir
  const dataTerakhir = dataLaporan.slice(0, 6).reverse(); 

  const labels = dataTerakhir.map(item => new Date(item.bulan).toLocaleString('id-ID', { month: 'short', year: '2-digit' }));
  const pemasukan = dataTerakhir.map(item => parseFloat(item.pemasukan) / 1000); // Bagi 1000 agar nilai di Y Axis tidak terlalu besar
  const pengeluaran = dataTerakhir.map(item => parseFloat(item.pengeluaran) / 1000); 

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: pemasukan,
        color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`, // Hijau (Pemasukan)
        label: "Pemasukan"
      },
      {
        data: pengeluaran,
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Merah (Pengeluaran)
        label: "Pengeluaran"
      }
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#f0f0f0',
    decimalPlaces: 0, // Tidak ada desimal
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
        fontSize: 10
    }
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.judul}>Grafik Bulanan (Ribu Rupiah)</Text>
      
      {dataLaporan.length > 0 ? (
        <BarChart
          style={styles.grafik}
          data={chartData}
          width={screenWidth - 20} // Lebar layar dikurangi padding
          height={300}
          yAxisLabel="Rp"
          yAxisSuffix="k" // Tambahkan 'k' untuk ribuan
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          fromZero={true}
        />
      ) : (
        <Text style={styles.info}>Silakan masukkan beberapa transaksi untuk melihat laporan.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5'
  },
  judul: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  grafik: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 0,
  },
  info: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16
  }
});

export default Laporan;