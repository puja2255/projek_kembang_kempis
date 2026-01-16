import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, Image, Pressable } from 'react-native';
import { ThemeProvider, useTheme } from '../komponen/ThemeContext';
import DarkModeToggle from '../komponen/DarkModeToggle';

/* Wrapper agar Stack bisa akses Theme */
function LayoutWrapper() {
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === 'dark';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#121212' : '#F5F5F5',
      }}
    >
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',

          // Gabungkan DarkModeToggle dan Avatar di kanan
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
              {/* Dark Mode Toggle di kiri */}
              <View style={{ marginRight: 12 }}>
                <DarkModeToggle />
              </View>

              {/* Avatar Profil di kanan */}
              <Pressable onPress={() => router.push('/profil')}>
                <Image
                  source={{ uri: 'https://i.pravatar.cc/150' }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                  }}
                />
              </Pressable>
            </View>
          ),
        }}
      >
        {/* Home */}
        <Stack.Screen
          name="index"
          options={{ title: 'Kembang Kempis' }}
        />

        {/* Tambah Transaksi */}
        <Stack.Screen
          name="inputan"
          options={{
            title: 'Tambah Transaksi Baru',
            presentation: 'modal',
          }}
        />

        {/* Laporan */}
        <Stack.Screen
          name="laporan"
          options={{ title: 'Laporan Grafis' }}
        />

        {/* Profil */}
        <Stack.Screen
          name="profil"
          options={{ title: 'Profil' }}
        />

        {/* Edit Profil */}
        <Stack.Screen
          name="edit-profil"
          options={{ title: 'Edit Profil' }}
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