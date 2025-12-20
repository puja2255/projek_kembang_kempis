// mobile/app/laporan.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { useTheme } from "../komponen/ThemeContext";
import { API_URL } from '../config'; 

const screenWidth = Dimensions.get("window").width;

type LaporanItem = {
  bulan: string; 
  pemasukan: string;
  pengeluaran: string;
};

const Laporan: React.FC = () => {
  const { theme } = useTheme(); 
  const isDark = theme === "dark";

  const [dataLaporan, setDataLaporan] = useState<LaporanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const [timeFilter, setTimeFilter] = useState<"Tahun" | "Bulan" | "Minggu">("Bulan");

  const ambilLaporan = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/laporan`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      setDataLaporan(json);
    } catch (error) {
      console.error("Gagal mengambil laporan:", error);
      Alert.alert("Koneksi Gagal", "Gagal memuat data laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ambilLaporan();
  }, []);

  // FUNGSI FORMAT DINAMIS UNTUK TOTAL (Juta vs Ribu)
  const formatValueDinamis = (nilai: number) => {
    if (nilai >= 1000000) {
      return `Rp ${(nilai / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Juta`;
    } else if (nilai >= 1000) {
      return `Rp ${(nilai / 1000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
    }
    return `Rp ${nilai.toLocaleString("id-ID")}`;
  };

  const dapatkanDataGrafik = () => {
    let labels: string[] = [];
    let masukan: number[] = [];
    let keluaran: number[] = [];

    // Ambil data mentah tanpa pembagi agar perhitungan total akurat
    if (timeFilter === "Tahun") {
      const grouped: any = {};
      dataLaporan.forEach(item => {
        const tahun = new Date(item.bulan).getFullYear().toString();
        if (!grouped[tahun]) grouped[tahun] = { in: 0, out: 0 };
        grouped[tahun].in += parseFloat(item.pemasukan); 
        grouped[tahun].out += parseFloat(item.pengeluaran);
      });
      labels = Object.keys(grouped);
      masukan = labels.map(l => grouped[l].in);
      keluaran = labels.map(l => grouped[l].out);
    } 
    else if (timeFilter === "Minggu") {
      const dataTerakhir = dataLaporan[0];
      labels = ["Mgg 1", "Mgg 2", "Mgg 3", "Mgg 4"];
      const valIn = dataTerakhir ? parseFloat(dataTerakhir.pemasukan) : 0;
      const valOut = dataTerakhir ? parseFloat(dataTerakhir.pengeluaran) : 0;
      masukan = [valIn * 0.2, valIn * 0.3, valIn * 0.25, valIn * 0.25];
      keluaran = [valOut * 0.1, valOut * 0.4, valOut * 0.3, valOut * 0.2];
    } 
    else {
      const dataTerbatas = dataLaporan.slice(0, 6).reverse();
      labels = dataTerbatas.map(item => 
        new Date(item.bulan).toLocaleString("id-ID", { month: "short" })
      );
      masukan = dataTerbatas.map(item => parseFloat(item.pemasukan));
      keluaran = dataTerbatas.map(item => parseFloat(item.pengeluaran));
    }

    return { labels, masukan, keluaran };
  };

  const { labels, masukan, keluaran } = dapatkanDataGrafik();
  
  const totalIn = masukan.reduce((a, b) => a + b, 0);
  const totalOut = keluaran.reduce((a, b) => a + b, 0);

  // Skala untuk Grafik (menghindari grafik terlihat datar)
  const skalaData = (data: number[]) => data.map(v => v >= 1000000 ? v / 1000000 : v / 1000);
  const labelUnit = (data: number[]) => {
    const rataRata = data.reduce((a,b) => a+b, 0) / (data.length || 1);
    return rataRata >= 1000000 ? "(Juta)" : "(rb)";
  };

  const baseChartConfig = {
    backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
    backgroundGradientFrom: isDark ? "#1E1E1E" : "#FFFFFF",
    backgroundGradientTo: isDark ? "#2A2A2A" : "#F0F0F0",
    decimalPlaces: 1,
    color: (opacity = 1) => (isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`),
    labelColor: (opacity = 1) => (isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`),
    propsForLabels: { fontSize: 10 },
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#4a90e2" /></View>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}>
      <Text style={[styles.judul, { color: isDark ? "#FFFFFF" : "#000000" }]}>Laporan Transaksi</Text>

      {/* Filter Waktu */}
      <View style={[styles.switchContainer, { backgroundColor: isDark ? "#2A2A2A" : "#F0F0F0" }]}>
        {["Tahun", "Bulan", "Minggu"].map((f) => (
          <TouchableOpacity 
            key={f} 
            style={[styles.switchButton, timeFilter === f && { backgroundColor: "#4a90e2" }]}
            onPress={() => setTimeFilter(f as any)}
          >
            <Text style={[styles.switchText, { color: timeFilter === f ? "#FFF" : isDark ? "#AAA" : "#666" }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Tipe Diagram */}
      <View style={[styles.switchContainer, { backgroundColor: isDark ? "#1E1E1E" : "#EEE" }]}>
        {["bar", "line", "pie"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.switchButton, chartType === type && { backgroundColor: "#4a90e2" }]}
            onPress={() => setChartType(type as any)}
          >
            <Text style={[styles.switchText, { color: chartType === type ? "#FFF" : isDark ? "#CCC" : "#333" }]}>
              {type === "bar" ? "Batang" : type === "line" ? "Garis" : "Lingkaran"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* RINGKASAN TOTAL TRANSAKSI */}
      <View style={[styles.summaryCard, { backgroundColor: isDark ? "#1E1E1E" : "#F8F9FA" }]}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Masuk</Text>
          <Text style={[styles.summaryValue, { color: "#00c853" }]}>{formatValueDinamis(totalIn)}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: isDark ? "#333" : "#DDD" }]} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Keluar</Text>
          <Text style={[styles.summaryValue, { color: "#e53935" }]}>{formatValueDinamis(totalOut)}</Text>
        </View>
      </View>

      {chartType === "pie" ? (
        <View style={[styles.chartBox, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
          <Text style={[styles.subJudul, { color: isDark ? "#FFF" : "#000" }]}>Proporsi {timeFilter}</Text>
          <PieChart
            data={[
              { name: "In", population: totalIn, color: "#00c853", legendFontColor: isDark ? "#FFF" : "#000", legendFontSize: 12 },
              { name: "Out", population: totalOut, color: "#e53935", legendFontColor: isDark ? "#FFF" : "#000", legendFontSize: 12 }
            ]}
            width={screenWidth - 40} height={220} chartConfig={baseChartConfig} accessor="population" backgroundColor="transparent" paddingLeft="15" absolute
          />
        </View>
      ) : (
        <>
          {/* Box Pemasukan */}
          <View style={[styles.chartBox, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
            <Text style={[styles.subJudul, { color: "#00c853" }]}>Pemasukan {labelUnit(masukan)}</Text>
            {chartType === "bar" ? (
              <BarChart data={{ labels, datasets: [{ data: skalaData(masukan) }] }} width={screenWidth - 40} height={200} yAxisLabel="" yAxisSuffix="" chartConfig={{...baseChartConfig, color: () => "#00c853"}} fromZero />
            ) : (
              <LineChart data={{ labels, datasets: [{ data: skalaData(masukan) }] }} width={screenWidth - 40} height={200} chartConfig={{...baseChartConfig, color: () => "#00c853"}} bezier />
            )}
          </View>

          {/* Box Pengeluaran */}
          <View style={[styles.chartBox, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
            <Text style={[styles.subJudul, { color: "#e53935" }]}>Pengeluaran {labelUnit(keluaran)}</Text>
            {chartType === "bar" ? (
              <BarChart data={{ labels, datasets: [{ data: skalaData(keluaran) }] }} width={screenWidth - 40} height={200} yAxisLabel="" yAxisSuffix="" chartConfig={{...baseChartConfig, color: () => "#e53935"}} fromZero />
            ) : (
              <LineChart data={{ labels, datasets: [{ data: skalaData(keluaran) }] }} width={screenWidth - 40} height={200} chartConfig={{...baseChartConfig, color: () => "#e53935"}} bezier />
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  judul: { fontSize: 22, fontWeight: "bold", marginVertical: 15, textAlign: "center" },
  subJudul: { fontSize: 16, fontWeight: "600", marginBottom: 10, textAlign: "center" },
  chartBox: { marginBottom: 25, borderRadius: 12, padding: 15, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5 },
  switchContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 10, borderRadius: 10, padding: 5 },
  switchButton: { flex: 1, paddingVertical: 10, marginHorizontal: 3, borderRadius: 8, alignItems: "center" },
  switchText: { fontSize: 13, fontWeight: "600" },
  summaryCard: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 15, borderRadius: 15, marginBottom: 20, marginHorizontal: 5, elevation: 2 },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryLabel: { fontSize: 11, color: "#888", textTransform: 'uppercase', marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: "bold" },
  divider: { width: 1, height: '70%' },
});

export default Laporan;