import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from "../komponen/ThemeContext";
import { API_URL } from '../config';

const screenWidth = Dimensions.get("window").width;

const Laporan: React.FC = () => {
  const { theme } = useTheme(); 
  const isDark = theme === "dark";

  const [dataLaporan, setDataLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const [viewFilter, setViewFilter] = useState<'all' | 'in' | 'out'>('all');

  useEffect(() => {
    const ambilLaporan = async () => {
      try {
        const response = await fetch(`${API_URL}/laporan`);
        const json = await response.json();
        setDataLaporan(json);
      } finally { setLoading(false); }
    };
    ambilLaporan();
  }, []);

  const masukan = dataLaporan.map((i: any) => parseFloat(i.pemasukan) || 0);
  const keluaran = dataLaporan.map((i: any) => parseFloat(i.pengeluaran) || 0);
  const labels = dataLaporan.map((i: any) => new Date(i.bulan).toLocaleString("id-ID", { month: "short" }));

  const chartConfig = {
    backgroundGradientFrom: isDark ? "#1E1E1E" : "#FFF",
    backgroundGradientTo: isDark ? "#1E1E1E" : "#FFF",
    color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    decimalPlaces: 0,
    barPercentage: 0.6,
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#F5F7FB" }]}>
      <Text style={[styles.judul, { color: isDark ? "#FFF" : "#000" }]}>Statistik Keuangan</Text>

      {/* Switcher Tipe Grafik */}
      <View style={styles.chartTypeRow}>
        {(['bar', 'line', 'pie'] as const).map((type) => (
          <TouchableOpacity 
            key={type} 
            style={[styles.typeBtn, chartType === type && styles.activeTypeBtn]} 
            onPress={() => setChartType(type)}
          >
            <MaterialCommunityIcons 
              name={type === 'bar' ? 'chart-bar' : type === 'line' ? 'chart-line' : 'chart-pie'} 
              size={20} color={chartType === type ? '#fff' : '#888'} 
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Konten Grafik */}
      <View style={[styles.chartCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
        {chartType === 'pie' ? (
          <PieChart
            data={[
              { name: 'Masuk', population: masukan.reduce((a, b) => a + b, 0), color: '#27ae60', legendFontColor: isDark ? '#FFF' : '#000' },
              { name: 'Keluar', population: keluaran.reduce((a, b) => a + b, 0), color: '#e74c3c', legendFontColor: isDark ? '#FFF' : '#000' },
            ]}
            width={screenWidth - 60} height={200} chartConfig={chartConfig} accessor="population" backgroundColor="transparent" paddingLeft="15" absolute
          />
        ) : (
          chartType === 'bar' ? (
            <BarChart
              data={{ labels, datasets: [{ data: viewFilter === 'out' ? keluaran : masukan }] }}
              width={screenWidth - 60} height={220} chartConfig={chartConfig} yAxisLabel="Rp" yAxisSuffix="" fromZero
            />
          ) : (
            <LineChart
              data={{ labels, datasets: [{ data: masukan, color: () => '#27ae60' }, { data: keluaran, color: () => '#e74c3c' }] }}
              width={screenWidth - 60} height={220} chartConfig={chartConfig} bezier
            />
          )
        )}
      </View>
      
      {/* Ringkasan Angka */}
      <View style={styles.summaryRow}>
          <View style={[styles.miniCard, { borderLeftColor: '#27ae60', backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
            <Text style={styles.miniLabel}>Total Masuk</Text>
            <Text style={[styles.miniValue, { color: '#27ae60' }]}>Rp {masukan.reduce((a, b) => a + b, 0).toLocaleString()}</Text>
          </View>
          <View style={[styles.miniCard, { borderLeftColor: '#e74c3c', backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
            <Text style={styles.miniLabel}>Total Keluar</Text>
            <Text style={[styles.miniValue, { color: '#e74c3c' }]}>Rp {keluaran.reduce((a, b) => a + b, 0).toLocaleString()}</Text>
          </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  judul: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  chartTypeRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 20 },
  typeBtn: { padding: 12, borderRadius: 12, backgroundColor: '#eee' },
  activeTypeBtn: { backgroundColor: '#2d9cdb' },
  chartCard: { padding: 15, borderRadius: 20, elevation: 3, alignItems: 'center' },
  summaryRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  miniCard: { flex: 1, padding: 15, borderRadius: 12, borderLeftWidth: 5, elevation: 2 },
  miniLabel: { fontSize: 12, color: '#888' },
  miniValue: { fontSize: 14, fontWeight: 'bold', marginTop: 5 }
});

export default Laporan;