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
  Modal,
  Platform,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [viewFilter, setViewFilter] = useState<'all' | 'in' | 'out'>('all');

  // --- TAMBAHAN FILTER TANGGAL (SAMA SEPERTI INDEX) ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modeFilterWaktu, setModeFilterWaktu] = useState<'Semua' | 'Hari' | 'Bulan' | 'Tahun'>('Bulan');
  const [tanggalPilihan, setTanggalPilihan] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

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

  const handleConfirmDate = (event: any, date?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date) setTanggalPilihan(date);
  };

  // --- LOGIKA FILTER DATA (SAMA SEPERTI INDEX) ---
  const filteredLaporan = dataLaporan.filter((item) => {
    const tglItem = new Date(item.bulan);
    let matchesWaktu = true;

    if (modeFilterWaktu === 'Hari') {
      matchesWaktu = tglItem.toDateString() === tanggalPilihan.toDateString();
    } else if (modeFilterWaktu === 'Bulan') {
      matchesWaktu = tglItem.getMonth() === tanggalPilihan.getMonth() && 
                     tglItem.getFullYear() === tanggalPilihan.getFullYear();
    } else if (modeFilterWaktu === 'Tahun') {
      matchesWaktu = tglItem.getFullYear() === tanggalPilihan.getFullYear();
    }
    return matchesWaktu;
  });

  const formatValueDinamis = (nilai: number) => {
    if (nilai >= 1000000) return `Rp ${(nilai / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Juta`;
    if (nilai >= 1000) return `Rp ${(nilai / 1000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
    return `Rp ${nilai.toLocaleString("id-ID")}`;
  };

  const dapatkanDataGrafik = () => {
    let labels: string[] = [];
    let masukan: number[] = [];
    let keluaran: number[] = [];

    // Menggunakan filteredLaporan hasil filter tanggal
    const dataTerbatas = filteredLaporan.slice(0, 6).reverse();
    
    labels = dataTerbatas.map(item => new Date(item.bulan).toLocaleString("id-ID", { month: "short" }));
    masukan = dataTerbatas.map(item => parseFloat(item.pemasukan));
    keluaran = dataTerbatas.map(item => parseFloat(item.pengeluaran));
    
    return { labels: labels.length > 0 ? labels : ["-"], masukan: masukan.length > 0 ? masukan : [0], keluaran: keluaran.length > 0 ? keluaran : [0] };
  };

  const { labels, masukan, keluaran } = dapatkanDataGrafik();
  const totalIn = masukan.reduce((a, b) => a + b, 0);
  const totalOut = keluaran.reduce((a, b) => a + b, 0);

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

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#4a90e2" /></View>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}>
      <Text style={[styles.judul, { color: isDark ? "#FFFFFF" : "#000000" }]}>Laporan Transaksi</Text>

      {/* Baris Filter (Gaya Index) */}
      <View style={styles.rowDropdown}>
        <TouchableOpacity 
          style={[styles.filterBtn, { backgroundColor: isDark ? "#1E1E1E" : "#F0F0F0" }]} 
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons name="tune-vertical" size={20} color="#2d9cdb" />
          <Text style={{ color: isDark ? "#FFF" : "#000", fontWeight: 'bold', marginLeft: 8 }}>
            Filter Waktu ▼
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterBtn, { backgroundColor: isDark ? "#1E1E1E" : "#F0F0F0" }]} 
          onPress={() => setChartType(chartType === "bar" ? "line" : chartType === "line" ? "pie" : "bar")}
        >
          <Text style={{ color: isDark ? "#FFF" : "#000", fontWeight: 'bold' }}>Tipe: {chartType.toUpperCase()} ▼</Text>
        </TouchableOpacity>
      </View>

      {/* Label Info Filter Aktif */}
      {modeFilterWaktu !== 'Semua' && (
        <View style={styles.activeFilterLabel}>
          <Text style={{ color: '#2d9cdb', fontSize: 12, fontWeight: '700' }}>
            Periode: {modeFilterWaktu === 'Hari' ? tanggalPilihan.toLocaleDateString('id-ID') : 
                      modeFilterWaktu === 'Bulan' ? tanggalPilihan.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 
                      tanggalPilihan.getFullYear()}
          </Text>
        </View>
      )}

      {/* Tab Filter */}
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

      {/* MODAL FILTER (IDENTIK DENGAN INDEX) */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#333' }]}>Pengaturan Waktu</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={isDark ? '#888' : '#666'} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalModeRow}>
              {(['Semua', 'Hari', 'Bulan', 'Tahun'] as const).map((m) => (
                <TouchableOpacity key={m} onPress={() => setModeFilterWaktu(m)} style={[styles.modeBtn, modeFilterWaktu === m && styles.modeBtnActive]}>
                  <Text style={[styles.modeBtnText, modeFilterWaktu === m && { color: '#FFF' }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {modeFilterWaktu !== 'Semua' && (
              <TouchableOpacity style={[styles.dateSelector, { backgroundColor: isDark ? '#222' : '#f9f9f9' }]} onPress={() => setShowPicker(true)}>
                <MaterialCommunityIcons name="calendar" size={20} color="#2d9cdb" />
                <Text style={{ marginLeft: 10, color: isDark ? '#FFF' : '#333' }}>
                  {tanggalPilihan.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.applyBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.applyBtnText}>Terapkan Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showPicker && (
        <DateTimePicker value={tanggalPilihan} mode="date" display="default" onChange={handleConfirmDate} />
      )}

      {/* Area Grafik (Tetap Sama) */}
      {chartType === "pie" ? (
        <View style={[styles.chartBox, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
          <PieChart
            data={[
              { name: `In`, population: totalIn, color: "#00c853", legendFontColor: isDark ? "#FFF" : "#000", legendFontSize: 12 },
              { name: `Out`, population: totalOut, color: "#e53935", legendFontColor: isDark ? "#FFF" : "#000", legendFontSize: 12 }
            ]}
            width={screenWidth - 40} height={220} chartConfig={baseChartConfig} accessor="population" backgroundColor="transparent" paddingLeft="15" absolute
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
  summaryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 15, marginBottom: 20 },
  tabBtn: { alignItems: 'center', flex: 1, paddingVertical: 10, borderRadius: 12 },
  activeTab: { backgroundColor: 'rgba(74, 144, 226, 0.1)', borderWidth: 1, borderColor: '#4a90e2' },
  symbolBtnKotak: { width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
  symbolIcon: { fontSize: 20, fontWeight: 'bold' },
  tabLabel: { fontSize: 10, color: "#888", fontWeight: '600', textTransform: 'uppercase' },
  tabValue: { fontSize: 13, fontWeight: "bold" },
  rowDropdown: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  filterBtn: { flex: 0.48, flexDirection: 'row', padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  activeFilterLabel: { marginBottom: 10, paddingLeft: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', padding: 20, borderRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalModeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modeBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  modeBtnActive: { backgroundColor: '#2d9cdb', borderColor: '#2d9cdb' },
  modeBtnText: { fontSize: 12, color: '#666', fontWeight: '600' },
  dateSelector: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginBottom: 20 },
  applyBtn: { backgroundColor: '#2d9cdb', padding: 15, borderRadius: 12, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default Laporan;