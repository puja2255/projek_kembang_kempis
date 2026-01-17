import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Animated,
  PanResponder,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTheme } from "../komponen/ThemeContext";
import FilterModal from "../komponen/FilterModal"; 
import { API_URL } from '../config';
import { formatRupiah } from "../komponen/tipe";

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
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modeFilterWaktu, setModeFilterWaktu] = useState<'Semua' | 'Hari' | 'Bulan' | 'Tahun'>('Bulan');
  const [tanggalPilihan, setTanggalPilihan] = useState<Date>(new Date());
  
  const [viewFilter, setViewFilter] = useState<'all' | 'in' | 'out'>('all');

  // --- LOGIKA DRAGGABLE FAB ---
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          // @ts-ignore
          x: pan.x._value,
          // @ts-ignore
          y: pan.y._value
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

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

  // --- FUNGSI EXPORT PDF ---
  const exportKePDF = async () => {
    if (filteredLaporan.length === 0) {
      Alert.alert("Info", "Tidak ada data untuk diekspor.");
      return;
    }

    const rows = filteredLaporan.map((item, index) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${new Date(item.bulan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
        <td style="border: 1px solid #ddd; padding: 8px; color: green;">Rp ${parseFloat(item.pemasukan).toLocaleString('id-ID')}</td>
        <td style="border: 1px solid #ddd; padding: 8px; color: red;">Rp ${parseFloat(item.pengeluaran).toLocaleString('id-ID')}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1 style="text-align: center; color: #2d9cdb;">Laporan Rekapitulasi</h1>
          <p style="text-align: center;">Periode: ${modeFilterWaktu} (${tanggalPilihan.toLocaleDateString('id-ID')})</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
            <p><b>Total Pemasukan:</b> <span style="color: green;">Rp ${totalIn.toLocaleString('id-ID')}</span></p>
            <p><b>Total Pengeluaran:</b> <span style="color: red;">Rp ${totalOut.toLocaleString('id-ID')}</span></p>
            <p><b>Selisih:</b> <b>Rp ${(totalIn - totalOut).toLocaleString('id-ID')}</b></p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #2d9cdb; color: white;">
                <th style="border: 1px solid #ddd; padding: 8px;">No</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Tanggal/Bulan</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Pemasukan</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Pengeluaran</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Error", "Gagal mengekspor laporan.");
    }
  };

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
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}>
        <Text style={[styles.judul, { color: isDark ? "#FFFFFF" : "#000000" }]}>Laporan Transaksi</Text>

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

        <FilterModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          modeWaktu={modeFilterWaktu}
          onModeWaktuChange={setModeFilterWaktu}
          tanggal={tanggalPilihan}
          onTanggalChange={setTanggalPilihan}
        />

        <View style={styles.activeFilterLabel}>
            <Text style={{ color: '#2d9cdb', fontSize: 12, fontWeight: '700' }}>
              Periode: {modeFilterWaktu === 'Semua' ? 'Semua Data' : 
                        modeFilterWaktu === 'Hari' ? tanggalPilihan.toLocaleDateString('id-ID') : 
                        modeFilterWaktu === 'Bulan' ? tanggalPilihan.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 
                        tanggalPilihan.getFullYear()}
            </Text>
        </View>

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

      {/* DRAGGABLE FAB PDF */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.fab, { backgroundColor: '#e74c3c', transform: pan.getTranslateTransform() }]}
      >
        <TouchableOpacity onPress={exportKePDF} activeOpacity={0.8} style={styles.fabTouch}>
          <MaterialCommunityIcons name="file-pdf-box" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
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
  fab: { position: 'absolute', right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, elevation: 8, zIndex: 999 },
  fabTouch: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }
});

export default Laporan;