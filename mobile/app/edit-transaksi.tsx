import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '../komponen/ThemeContext';
import { API_URL } from '../config';
import { getFormStyles } from '../styles/formStyles'; // Import CSS Eksternal

const EditTransaksi: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Menggunakan style eksternal
  const styles = getFormStyles(isDark);

  // --- STATE FORM ---
  const [jenis, setJenis] = useState<string>((params.jenis as string) || 'Pengeluaran');
  const [jumlah, setJumlah] = useState<string>((params.jumlah as string) || '');
  const [deskripsi, setDeskripsi] = useState<string>((params.deskripsi as string) || '');
  const [tanggal, setTanggal] = useState<Date>(
    params.tanggal ? new Date(params.tanggal as string) : new Date()
  );
  
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- FUNGSI UPDATE DATA ---
  const handleUpdate = async () => {
    if (!jumlah || !deskripsi) {
      Alert.alert('Peringatan', 'Jumlah dan Deskripsi tidak boleh kosong!');
      return;
    }

    if (!params.id) {
      Alert.alert('Error', 'ID Transaksi tidak ditemukan.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/transaksi/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis,
          jumlah: parseFloat(jumlah),
          deskripsi,
          tanggal: tanggal.toISOString(),
        }),
      });

      if (response.ok) {
        Alert.alert('Berhasil', 'Transaksi telah diperbarui!', [
          { text: 'OK', onPress: () => router.replace('/') } 
        ]);
      } else {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Gagal memperbarui data.');
      }
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setTanggal(selectedDate);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        style={{ backgroundColor: isDark ? '#121212' : '#F5F7FA' }}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.headerTitle}>Edit Transaksi</Text>
          
          {/* Tab Jenis */}
          <Text style={styles.label}>Jenis Transaksi</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[styles.typeTab, jenis === 'Pemasukan' && styles.activeTabIn]}
              onPress={() => setJenis('Pemasukan')}
            >
              <Text style={[styles.typeText, { color: jenis === 'Pemasukan' ? '#FFF' : (isDark ? '#AAA' : '#666') }]}>
                Pemasukan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeTab, jenis === 'Pengeluaran' && styles.activeTabOut]}
              onPress={() => setJenis('Pengeluaran')}
            >
              <Text style={[styles.typeText, { color: jenis === 'Pengeluaran' ? '#FFF' : (isDark ? '#AAA' : '#666') }]}>
                Pengeluaran
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Jumlah */}
          <Text style={styles.label}>Jumlah (Rp)</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencyPrefix}>Rp</Text>
            <TextInput
              style={[styles.input, styles.inputLarge]}
              keyboardType="numeric"
              value={jumlah}
              onChangeText={(text) => setJumlah(text.replace(/[^0-9]/g, ''))}
              placeholder="0"
              placeholderTextColor={isDark ? '#444' : '#CCC'}
            />
          </View>

          {/* Input Deskripsi */}
          <Text style={styles.label}>Deskripsi</Text>
          <View style={[styles.inputWrapper, styles.inputArea]}>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              value={deskripsi}
              onChangeText={setDeskripsi}
              placeholder="Contoh: Makan siang"
              placeholderTextColor={isDark ? '#555' : '#BBB'}
            />
          </View>

          {/* Input Tanggal */}
          <Text style={styles.label}>Tanggal</Text>
          <TouchableOpacity 
            style={styles.datePickerBtn} 
            onPress={() => setShowPicker(true)}
          >
            <Text style={{ color: isDark ? '#FFF' : '#000' }}>
              {tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
            <MaterialCommunityIcons name="calendar" size={20} color="#2d9cdb" />
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker 
              value={tanggal} 
              mode="date" 
              display="default" 
              onChange={onChangeDate} 
            />
          )}

          {/* Tombol Simpan */}
          <TouchableOpacity 
            style={[styles.btnSimpan, { opacity: loading ? 0.7 : 1 }]} 
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnSimpanText}>Simpan Perubahan</Text>
            )}
          </TouchableOpacity>

          {/* Tombol Kembali */}
          <TouchableOpacity style={styles.btnBatal} onPress={() => router.back()}>
            <Text style={styles.btnBatalText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditTransaksi;