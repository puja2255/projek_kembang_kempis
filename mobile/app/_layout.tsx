import React from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { ThemeProvider, useTheme } from '../komponen/ThemeContext';

/* Wrapper untuk Stack agar bisa pakai theme */
function LayoutWrapper() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme === 'dark' ? '#121212' : '#F5F5F5',
      }}
    >
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
          },
          headerTintColor: theme === 'dark' ? '#FFFFFF' : '#000000',
        }}
      >

        {/* index.tsx (Layar Home) */}
        <Stack.Screen
          name="index"
          options={{
            title: 'Kembang Kempis',
            headerShown: true,
          }}
        />

        {/* inputan.tsx (Layar Tambah Transaksi) */}
        <Stack.Screen
          name="inputan"
          options={{
            title: 'Tambah Transaksi Baru',
            presentation: 'modal',
          }}
        />

        {/* laporan.tsx (Layar Laporan Grafis) */}
        <Stack.Screen
          name="laporan"
          options={{
            title: 'Laporan Grafis',
          }}
        />

      </Stack>
    </View>
  );
}

/* Root Layout */
export default function RootLayout() {
  return (
    <ThemeProvider>
      <LayoutWrapper />
    </ThemeProvider>
  );
}
