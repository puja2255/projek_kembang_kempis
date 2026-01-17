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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from "../komponen/ThemeContext";
import FilterModal from "../komponen/FilterModal"; // Import Komponen Reusable
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
  const [openTipe, setOpenTipe] = useState(false);
  
  // State untuk Filter (Sinkron dengan Index)
  const [modalVisible, setModalVisible] = useState(false);
  const [modeFilterWaktu, setModeFilterWaktu] = useState<'Semua' | 'Hari' | 'Bulan' | 'Tahun'>('Bulan');
  const [tanggalPilihan, setTanggalPilihan] = useState<Date>(new Date());
  
  const [viewFilter, setViewFilter] = useState<'all' | 'in' | 'out'>('all');

  const ambilLaporan = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/laporan`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      setDataLaporan(json);
    } catch (error) {
      console.error("Gagal mengambil laporan:", error);
      Alert.alert("Error", "Gagal memuat data laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ambilLaporan();
  }, []);

  // Logika Filter Data untuk Grafik
  const filteredLaporan = dataLaporan.filter((item) => {
    const tglItem = new Date(item.bulan);
    if (modeFilterWaktu === 'Semua') return true;
    if (modeFilterWaktu === 'Hari') return tglItem.toDateString() === tanggalPilihan.toDateString();
    if (modeFilterWaktu === 'Bulan') return tglItem.getMonth() === tanggalPilihan.getMonth() && tglItem.getFullYear() === tanggalPilihan.getFullYear();
    if (modeFilterWaktu === 'Tahun') return tglItem.getFullYear() === tanggalPilihan.getFullYear();
    return true;
  });

  const dapatkanDataGrafik = () => {
    const dataTerbatas = filteredLaporan.slice(0, 6).reverse();
    const labels = dataTerbatas.map(item => new Date(item.bulan).toLocaleString("id-ID", { month: "short" }));
    const masukan = dataTerbatas.map(item => parseFloat(item.pemasukan));
    const keluaran = dataTerbatas.map(item => parseFloat(item.pengeluaran));
    return { 
      labels: labels.length > 0 ? labels : ["-"], 
      masukan: masukan.length > 0 ? masukan : [0], 
      keluaran: keluaran.length > 0 ? keluaran : [0] 
    };
  };

  const { labels, masukan, keluaran } = dapatkanDataGrafik();
  const totalIn = masukan.reduce((a, b) => a + b, 0);
  const totalOut = keluaran.reduce((a, b) => a + b, 0);

  const formatValueDinamis = (nilai: number) => {
    if (nilai >= 1000000) return `Rp ${(nilai / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Juta`;
    if (nilai >= 1000) return `Rp ${(nilai / 1000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
    return `Rp ${nilai.toLocaleString("id-ID")}`;
  };

  const skalaData = (data: number[]) => data.map(v => v >= 1000000 ? v / 1000000 : v / 1000);
  const labelUnit = (data: number[]) => (data.reduce((a,b) => a+b, 0) / (data.length || 1)) >= 1000000 ? "(Juta)" : "(rb)";

  const baseChartConfig = {
    backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
    backgroundGradientFrom: isDark ? "#1E1E1E" : "#FFFFFF",
    backgroundGradientTo: isDark ? "#2A2A2A" : "#F0F0F0",
    decimalPlaces: 1,
    color: (opacity = 1) => (isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`),
    labelColor: (opacity = 1) => (isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`),
    propsForLabels: { fontSize: 10 },
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#2d9cdb" /></View>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}>
      <Text style={[styles.judul, { color: isDark ? "#FFFFFF" : "#000000" }]}>Laporan Transaksi</Text>

      {/* Baris Kontrol */}
      <View style={styles.rowDropdown}>
        <TouchableOpacity 
          style={[styles.filterBtn, { backgroundColor: isDark ? '#1E1E1E' : '#fff', borderColor: isDark ? '#333' : '#ccc' }]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons name="tune-vertical" size={20} color="#2d9cdb" />
          <Text style={{ marginLeft: 8, color: isDark ? '#fff' : '#333', fontWeight: '700' }}>Filter</Text>
        </TouchableOpacity>

        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={[styles.dropdownBtn, { backgroundColor: isDark ? "#1E1E1E" : "#F0F0F0" }]} 
            onPress={() => setOpenTipe(!openTipe)}
          >
            <Text style={[styles.btnText, { color: isDark ? "#FFF" : "#000" }]}>
               {chartType === "bar" ? "Batang" : chartType === "line" ? "Garis" : "Lingkaran"} ▼
            </Text>
          </TouchableOpacity>
          {openTipe && (
            <View style={[styles.dropdownList, { backgroundColor: isDark ? "#2A2A2A" : "#FFF" }]}>
              {[{ id: "bar", label: "Batang" }, { id: "line", label: "Garis" }, { id: "pie", label: "Lingkaran" }].map((item) => (
                <TouchableOpacity key={item.id} style={styles.dropdownItem} onPress={() => { setChartType(item.id as any); setOpenTipe(false); }}>
                  <Text style={{ color: isDark ? "#FFF" : "#000" }}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* --- PENGGUNAAN FILTER MODAL REUSABLE --- */}
      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        // onFilterJenisChange TIDAK DIKIRIM agar tipe transaksi tersembunyi
        modeWaktu={modeFilterWaktu}
        onModeWaktuChange={setModeFilterWaktu}
        tanggal={tanggalPilihan}
        onTanggalChange={setTanggalPilihan}
      />

      {/* Info Periode */}
      <View style={styles.activeFilterLabel}>
          <Text style={{ color: '#2d9cdb', fontSize: 12, fontWeight: '700' }}>
            Periode: {modeFilterWaktu === 'Semua' ? 'Semua Data' : 
                      modeFilterWaktu === 'Hari' ? tanggalPilihan.toLocaleDateString('id-ID') : 
                      modeFilterWaktu === 'Bulan' ? tanggalPilihan.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 
                      tanggalPilihan.getFullYear()}
          </Text>
      </View>

      {/* Tab Filter Tampilan */}
      <View style={[styles.summaryCard, { backgroundColor: isDark ? "#1E1E1E" : "#F8F9FA" }]}>
        <TouchableOpacity style={[styles.tabBtn, viewFilter === 'in' && styles.activeTab]} onPress={() => setViewFilter('in')}>
          <Text style={styles.tabLabel}>Masuk</Text>
          <Text style={[styles.tabValue, { color: "#00c853" }]}>{formatValueDinamis(totalIn).replace('Rp ', '')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.symbolBtnKotak, { backgroundColor: viewFilter === 'all' ? "#4a90e2" : isDark ? "#333" : "#E0E0E0" }]} onPress={() => setViewFilter('all')}>
          <Text style={[styles.symbolIcon, { color: viewFilter === 'all' ? "#FFF" : isDark ? "#888" : "#666" }]}>☷</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, viewFilter === 'out' && styles.activeTab]} onPress={() => setViewFilter('out')}>
          <Text style={styles.tabLabel}>Keluar</Text>
          <Text style={[styles.tabValue, { color: "#e53935" }]}>{formatValueDinamis(totalOut).replace('Rp ', '')}</Text>
        </TouchableOpacity>
      </View>

      {/* Grafik */}
      {chartType === "pie" ? (
        <View style={[styles.chartBox, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
          <PieChart
            data={[
              { name: `Masuk`, population: totalIn, color: "#00c853", legendFontColor: isDark ? "#FFF" : "#000" },
              { name: `Keluar`, population: totalOut, color: "#e53935", legendFontColor: isDark ? "#FFF" : "#000" }
            ]}
            width={screenWidth - 40}
            height={220}
            chartConfig={baseChartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>
      ) : (
        <>
          {(viewFilter === 'all' || viewFilter === 'in') && (
            <View style={[styles.chartBox, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
              <Text style={[styles.subJudul, { color: "#00c853" }]}>Pemasukan {labelUnit(masukan)}</Text>
              {chartType === "bar" ? (
                <BarChart data={{ labels, datasets: [{ data: skalaData(masukan) }] }} width={screenWidth - 40} height={200} yAxisLabel="" yAxisSuffix="" chartConfig={{...baseChartConfig, color: () => "#00c853"}} fromZero />
              ) : (
                <LineChart data={{ labels, datasets: [{ data: skalaData(masukan) }] }} width={screenWidth - 40} height={200} chartConfig={{...baseChartConfig, color: () => "#00c853"}} bezier />
              )}
            </View>
          )}

          {(viewFilter === 'all' || viewFilter === 'out') && (
            <View style={[styles.chartBox, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
              <Text style={[styles.subJudul, { color: "#e53935" }]}>Pengeluaran {labelUnit(keluaran)}</Text>
              {chartType === "bar" ? (
                <BarChart data={{ labels, datasets: [{ data: skalaData(keluaran) }] }} width={screenWidth - 40} height={200} yAxisLabel="" yAxisSuffix="" chartConfig={{...baseChartConfig, color: () => "#e53935"}} fromZero />
              ) : (
                <LineChart data={{ labels, datasets: [{ data: skalaData(keluaran) }] }} width={screenWidth - 40} height={200} chartConfig={{...baseChartConfig, color: () => "#e53935"}} bezier />
              )}
            </View>
          )}
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
  chartBox: { marginBottom: 25, borderRadius: 12, padding: 15, elevation: 3 },
  rowDropdown: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, zIndex: 100 },
  filterBtn: { flex: 0.45, flexDirection: 'row', padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dropdownContainer: { flex: 0.45 },
  dropdownBtn: { padding: 12, borderRadius: 10, alignItems: 'center', elevation: 2 },
  btnText: { fontWeight: 'bold', fontSize: 14 },
  dropdownList: { position: 'absolute', top: 50, left: 0, right: 0, borderRadius: 10, elevation: 5, zIndex: 999 },
  dropdownItem: { padding: 12, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.1)', alignItems: 'center' },
  summaryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 15, marginBottom: 20 },
  tabBtn: { alignItems: 'center', flex: 1, paddingVertical: 10, borderRadius: 12 },
  activeTab: { backgroundColor: 'rgba(74, 144, 226, 0.1)', borderWidth: 1, borderColor: '#4a90e2' },
  symbolBtnKotak: { width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
  symbolIcon: { fontSize: 20 },
  tabLabel: { fontSize: 10, color: "#888", fontWeight: '600' },
  tabValue: { fontSize: 13, fontWeight: "bold" },
  activeFilterLabel: { marginBottom: 10, paddingLeft: 5 },
});

export default Laporan;