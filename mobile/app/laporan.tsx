import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  Button,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";

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
  const [chartType, setChartType] = useState<"bar" | "line">("bar"); // ✅ pilih chart

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
    new Date(item.bulan).toLocaleString("id-ID", {
      month: "short",
      year: "2-digit",
    })
  );

  const pemasukan = dataTerakhir.map((item) =>
    parseFloat(item.pemasukan) / 1000
  );
  const pengeluaran = dataTerakhir.map((item) =>
    parseFloat(item.pengeluaran) / 1000
  );

  const chartDataPemasukan = {
    labels,
    datasets: [{ data: pemasukan }],
  };

  const chartDataPengeluaran = {
    labels,
    datasets: [{ data: pengeluaran }],
  };

  const chartConfigPemasukan = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#f0f0f0",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`, // Hijau
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForLabels: { fontSize: 10 },
  };

  const chartConfigPengeluaran = {
    ...chartConfigPemasukan,
    color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Merah
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.judul}>Grafik Bulanan (Ribu Rupiah)</Text>

      {/* Tombol untuk ganti chart */}
      <View style={styles.switchContainer}>
        <Button
          title="Diagram Batang"
          onPress={() => setChartType("bar")}
          color={chartType === "bar" ? "blue" : "gray"}
        />
        <Button
          title="Diagram Garis"
          onPress={() => setChartType("line")}
          color={chartType === "line" ? "blue" : "gray"}
        />
      </View>

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
          style={styles.grafik}
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
          style={styles.grafik}
        />
      )}

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
          style={styles.grafik}
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
          style={styles.grafik}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  judul: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  subJudul: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
    textAlign: "center",
  },
  grafik: {
    marginVertical: 8,
    borderRadius: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
});

export default Laporan;