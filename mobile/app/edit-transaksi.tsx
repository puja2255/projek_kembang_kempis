import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../komponen/ThemeContext';
import { API_URL } from '../config';

const EditTransaksi = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // --- STATE FORM (Diisi otomatis dari params) ---
  const [jenis, setJenis] = useState<string>((params.jenis as string) || 'Pengeluaran');
  const [jumlah, setJumlah] = useState<string>((params.jumlah as string) || '');
  const [deskripsi, setDeskripsi] = useState<string>((params.deskripsi as string) || '');
  const [deskripsiTambahan, setDeskripsiTambahan] = useState<string>((params.deskripsiTambahan as string) || '');
  const [tanggal, setTanggal] = useState<Date>(params.tanggal ? new Date(params.tanggal as string) : new Date());
  
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- FUNGSI UPDATE DATA ---
  const handleUpdate = async () => {
    if (!jumlah || !deskripsi) {
      Alert.alert('Error', 'Jumlah dan Deskripsi harus diisi!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/transaksi/${params.id}`, {
        method: 'PUT', // Menggunakan PUT untuk update data
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis,
          jumlah: parseInt(jumlah),
          deskripsi,
          deskripsiTambahan,
          tanggal: tanggal.toISOString(),
        }),
      });

      if (response.ok) {
        Alert.alert('Berhasil', 'Transaksi telah diperbarui', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        throw new Error('Gagal memperbarui data');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setTanggal(selectedDate);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F7FB' }]}>
      <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
        <Text style={[styles.label, { color: isDark ? '#AAA' : '#666' }]}>Jenis Transaksi</Text>
        <View style={styles.tabContainer}>
          {['Pemasukan', 'Pengeluaran'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.tab,
                jenis === item && (item === 'Pemasukan' ? styles.tabMasuk : styles.tabKeluar),
                { borderColor: isDark ? '#333' : '#DDD' }
              ]}
              onPress={() => setJenis(item)}
            >
              <Text style={[styles.tabText, jenis === item && { color: '#FFF' }, { color: isDark && jenis !== item ? '#888' : '#444' }]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: isDark ? '#AAA' : '#666' }]}>Jumlah (Rp)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#252525' : '#F9F9F9', color: isDark ? '#FFF' : '#000' }]}
          keyboardType="numeric"
          value={jumlah}
          onChangeText={setJumlah}
          placeholder="0"
          placeholderTextColor="#888"
        />

        <Text style={[styles.label, { color: isDark ? '#AAA' : '#666' }]}>Deskripsi Utama</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#252525' : '#F9F9F9', color: isDark ? '#FFF' : '#000' }]}
          value={deskripsi}
          onChangeText={setDeskripsi}
          placeholder="Contoh: Makan Siang"
          placeholderTextColor="#888"
        />

        <Text style={[styles.label, { color: isDark ? '#AAA' : '#666' }]}>Catatan Tambahan (Opsional)</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#252525' : '#F9F9F9', color: isDark ? '#FFF' : '#000' }]}
          value={deskripsiTambahan}
          onChangeText={setDeskripsiTambahan}
          multiline
          placeholder="Detail lainnya..."
          placeholderTextColor="#888"
        />

        <Text style={[styles.label, { color: isDark ? '#AAA' : '#666' }]}>Tanggal</Text>
        <TouchableOpacity 
          style={[styles.input, styles.dateInput, { backgroundColor: isDark ? '#252525' : '#F9F9F9' }]} 
          onPress={() => setShowPicker(true)}
        ></TouchableOpacity>