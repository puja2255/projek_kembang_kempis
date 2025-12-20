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
import { API_URL } from "../config";

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
        <ActivityIndicator size="large" color="#4a90e2" />
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

  const pemasukan = dataTerakhir.map((item) => parseFloat(item.pemasukan) / 1000);
  const pengeluaran = dataTerakhir.map((item) => parseFloat(item.pengeluaran) / 1000);

  const chartDataPemasukan = { labels, datasets: [{ data: pemasukan }] };
  const chartDataPengeluaran = { labels, datasets: [{ data: pengeluaran }] };

  const baseChartConfig = {
    backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
    backgroundGradientFrom: isDark ? "#1E1E1E" : "#FFFFFF",
    backgroundGradientTo: isDark ? "#2A2A2A" : "#F0F0F0",
    decimalPlaces: 0,
    labelColor: () => (isDark ? "#FFFFFF" : "#000000"),
    propsForLabels: { fontSize: 10 },
  };

  const chartConfigPemasukan = {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(0, 200, 83, ${opacity})`,
  };

  const chartConfigPengeluaran = {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(229, 57, 53, ${opacity})`,
  };

  const totalPemasukan = pemasukan.reduce((a, b) => a + b, 0);
  const totalPengeluaran = pengeluaran.reduce((a, b) => a + b, 0);
  const total = totalPemasukan + totalPengeluaran || 1;

  const pieData = [
    {
      name: "Pemasukan",
      population: totalPemasukan,
      color: "#00c853",
      legendFontColor: isDark ? "#FFFFFF" : "#000000",
      legendFontSize: 12,
    },
    {
      name: "Pengeluaran",
      population: totalPengeluaran,
      color: "#e53935",
      legendFontColor: isDark ? "#FFFFFF" : "#000000",
      legendFontSize: 12,
    },
  ];

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#FFFFFF" },
      ]}
    >
      <Text style={[styles.judul, { color: isDark ? "#FFFFFF" : "#000000" }]}>
        Laporan Keuangan Bulanan
      </Text>

      {/* Switch Chart */}
      <View
        style={[
          styles.switchContainer,
          { backgroundColor: isDark ? "#1E1E1E" : "#EEE" },
        ]}
      >
        {["bar", "line", "pie"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.switchButton,
              {
                backgroundColor:
                  chartType === type
                    ? "#4a90e2"
                    : isDark
                    ? "#2A2A2A"
                    : "#DDD",
              },
            ]}
            onPress={() => setChartType(type as any)}
          >
            <Text
              style={[
                styles.switchText,
                { color: chartType === type ? "#FFF" : isDark ? "#CCC" : "#333" },
              ]}
            >
              {type === "bar"
                ? "Batang"
                : type === "line"
                ? "Garis"
                : "Lingkaran"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {chartType === "pie" ? (
        <View
          style={[
            styles.chartBox,
            { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" },
          ]}
        >
          <Text style={[styles.subJudul, { color: isDark ? "#FFF" : "#000" }]}>
            Komposisi Pemasukan vs Pengeluaran
          </Text>
          <Text style={{ textAlign: "center", marginBottom: 10, color: isDark ? "#FFF" : "#000" }}>
            Pemasukan: {((totalPemasukan / total) * 100).toFixed(1)}% | Pengeluaran: {((totalPengeluaran / total) * 100).toFixed(1)}%
          </Text>
          <PieChart
            data={pieData}
            width={screenWidth - 20}
            height={250}
            chartConfig={baseChartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>
      ) : (
        <>
          <View
            style={[
              styles.chartBox,
              { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" },
            ]}
          >
            <Text style={[styles.subJudul, { color: isDark ? "#FFF" : "#000" }]}>
              Pemasukan
            </Text>
            {chartType === "bar" ? (
              <BarChart
                data={chartDataPemasukan}
                width={screenWidth - 20}
                height={250}
                yAxisLabel="Rp"
                yAxisSuffix="k"
                chartConfig={chartConfigPemasukan}
                verticalLabelRotation={30}
                fromZero
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

          <View
            style={[
              styles.chartBox,
              { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" },
            ]}
          >
            <Text style={[styles.subJudul, { color: isDark ? "#FFF" : "#000" }]}>
              Pengeluaran
            </Text>
            {chartType === "bar" ? (
              <BarChart
                data={chartDataPengeluaran}
                width={screenWidth - 20}
                height={250}
                yAxisLabel="Rp"
                yAxisSuffix="k"
                chartConfig={chartConfigPengeluaran}
                verticalLabelRotation={30}
                fromZero
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
  container: { flex: 1, padding: 10 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  judul: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
 