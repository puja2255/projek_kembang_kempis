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

const API_URL = "http://192.168.56.1:3000";
const screenWidth = Dimensions.get("window").width;

type LaporanItem = {
  bulan: string;
  pemasukan: string;
  pengeluaran: string;
};

const Laporan: React.FC = () => {
  const [dataLaporan, setDataLaporan] = useState<LaporanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const dataTerakhir = dataLaporan.slice(0, 6).reverse();
  const labels = dataTerakhir.map((item) =>
    new Date(item.bulan).toLocaleString("id-ID", { month: "short", year: "2-digit" })
  );

  const pemasukan = dataTerakhir.map((item) => parseFloat(item.pemasukan) / 1000);
  const pengeluaran = dataTerakhir.map((item) => parseFloat(item.pengeluaran) / 1000);

  const chartDataPemasukan = { labels, datasets: [{ data: pemasukan }] };
  const chartDataPengeluaran = { labels, datasets: [{ data: pengeluaran }] };

  const chartConfigPemasukan = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#f0f0f0",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForLabels: { fontSize: 10 },
  };

  const chartConfigPengeluaran = {
    ...chartConfigPemasukan,
    color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
  };

  const totalPemasukan = pemasukan.reduce((a, b) => a + b, 0);
  const totalPengeluaran = pengeluaran.reduce((a, b) => a + b, 0);
  const total = totalPemasukan + totalPengeluaran;

  const pieData = [
    {
      name: `Pemasukan (${((totalPemasukan / total) * 100).toFixed(1)}%)`,
      population: totalPemasukan,
      color: "green",
      legendFontColor: "#000",
      legendFontSize: 12,
    },
    {
      name: `Pengeluaran (${((totalPengeluaran / total) * 100).toFixed(1)}%)`,
      population: totalPengeluaran,
      color: "red",
      legendFontColor: "#000",
      legendFontSize: 12,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.judul}>Laporan Keuangan Bulanan</Text>

      {/* Tombol pilihan diagram */}
      <View style={styles.switchContainer}>
        {["bar", "line", "pie"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.switchButton,
              chartType === type && styles.switchButtonActive,
            ]}
            onPress={() => setChartType(type as "bar" | "line" | "pie")}
          >
            <Text
              style={[
                styles.switchText,
                chartType === type && styles.switchTextActive,
              ]}
            >
              {type === "bar" ? "Batang" : type === "line" ? "Garis" : "Lingkaran"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {chartType === "pie" ? (
        <View style={styles.chartBox}>
          <Text style={styles.subJudul}>Komposisi Pemasukan vs Pengeluaran</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 20}
            height={250}
            chartConfig={chartConfigPemasukan}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        </View>
      ) : (
        <>
          <View style={styles.chartBox}>
            <Text style={styles.subJudul}>Pemasukan</Text>
            {chartType === "bar" ? (
              <BarChart
                data={chartDataPemasukan}
                width={screenWidth - 20}
                height={250}
                yAxisLabel="Rp"
                yAxisSuffix="k"
                chartConfig={chartConfigPemasukan}
                verticalLabelRotation={30}
                fromZero={true}
              />
            ) : (
              <LineChart
                data={chartDataPemasukan}
                width={screenWidth - 20}
                height={250}
                yAxisLabel="Rp"
                yAxisSuffix="k"
                chartConfig={chartConfigPemasukan}
                bezier
              />
            )}
          </View>

          <View style={styles.chartBox}>
            <Text style={styles.subJudul}>Pengeluaran</Text>
            {chartType === "bar" ? (
              <BarChart
                data={chartDataPengeluaran}
                width={screenWidth - 20}
                height={250}
                yAxisLabel="Rp"
                yAxisSuffix="k"
                chartConfig={chartConfigPengeluaran}
                verticalLabelRotation={30}
                fromZero={true}
              />
            ) : (
              <LineChart
                data={chartDataPengeluaran}
                width={screenWidth - 20}
                height={250}
                yAxisLabel="Rp"
                yAxisSuffix="k"
                chartConfig={chartConfigPengeluaran}
                bezier
              />
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  judul: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  subJudul: { fontSize: 16, fontWeight: "600", marginVertical: 10, textAlign: "center" },
  chartBox: { marginBottom: 25, backgroundColor: "#fff", borderRadius: 12, padding: 10, elevation: 2 },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#eee",
    borderRadius: 8,
    padding: 5,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: "#ddd",
    alignItems: "center",
  },
  switchButtonActive: { backgroundColor: "#4a90e2" },
  switchText: { fontSize: 14, color: "#333", fontWeight: "500" },
  switchTextActive: { color: "#fff", fontWeight: "bold" },
});

export default Laporan;