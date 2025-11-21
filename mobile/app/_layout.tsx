// mobile/app/_layout.tsx

import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
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
  );
}