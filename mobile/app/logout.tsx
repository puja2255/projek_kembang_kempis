"use client";

import { View, Text, Pressable, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../komponen/ThemeContext";

export default function LogoutPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleLogout = async () => {
    try {
      // 🔥 hapus data login
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      // redirect ke halaman login / home
      router.replace("/");
    } catch (err) {
      Alert.alert("Error", "Gagal logout");
    }
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <Stack.Screen
        options={{
          headerTitle: "Logout",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: isDark ? "#121212" : "#FFFFFF",
          },
          headerTintColor: isDark ? "#FFFFFF" : "#000000",
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ paddingHorizontal: 12 }}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={isDark ? "#FFF" : "#000"}
              />
            </Pressable>
          ),
        }}
      />

      {/* ================= KONTEN ================= */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
        }}
      >
        <Ionicons
          name="log-out-outline"
          size={64}
          color={isDark ? "#FFF" : "#000"}
          style={{ marginBottom: 16 }}
        />

        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            color: isDark ? "#FFF" : "#000",
            marginBottom: 8,
          }}
        >
          Keluar dari Aplikasi
        </Text>

        <Text
          style={{
            textAlign: "center",
            color: isDark ? "#AAA" : "#555",
            marginBottom: 24,
          }}
        >
          Apakah kamu yakin ingin logout dari aplikasi?
        </Text>

        {/* BUTTON */}
        <Pressable
          onPress={handleLogout}
          style={{
            width: "100%",
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: "#EF4444",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFF", fontWeight: "600" }}>
            Logout
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: isDark ? "#AAA" : "#555" }}>
            Batal
          </Text>
        </Pressable>
      </View>
    </>
  );
}