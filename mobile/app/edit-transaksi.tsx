import React, { useState } from 'react';
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

const EditTransaksi: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // --- STATE FORM (Inisialisasi dari data yang dikirim Home) ---
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
    // Validasi input wajib
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
          jumlah: parseFloat(jumlah), // Menggunakan parseFloat agar support desimal jika perlu
          deskripsi,
          tanggal: tanggal.toISOString(),
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        Alert.alert('Berhasil', 'Transaksi telah diperbarui!', [
          { text: 'OK', onPress: () => router.replace('/') } 
        ]);
      } else {
        throw new Error(result.error || 'Gagal memperbarui data di server.');
      }
    } catch (error: any) {
      console.error('Update Error:', error);
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
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F7FB' }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>Edit Transaksi</Text>
        
        {/* Tab Jenis */}
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
              <Text style={[
                styles.tabText, 
                jenis === item ? { color: '#FFF' } : { color: isDark ? '#888' : '#444' }
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Jumlah */}
        <Text style={[styles.label, { color: isDark ? '#AAA' : '#666' }]}>Jumlah (Rp)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#252525' : '#F9F9F9', color: isDark ? '#FFF' : '#000' }]}
          keyboardType="numeric"
          value={jumlah}
          onChangeText={setJumlah}
          placeholder="0"
          placeholderTextColor="#888"
        />

        {/* Input Deskripsi */}
        <Text style={[styles.label, { color: isDark ? '#AAA' : '#666' }]}>Deskripsi</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#252525' : '#F9F9F9', color: isDark ? '#FFF' : '#000' }]}
          value={deskripsi}
          onChangeText={setDeskripsi}
          placeholder="Contoh: Makan siang"
          placeholderTextColor="#888"
        />

        {/* Input Tanggal */}
        <Text style={[styles.label, { color: isDark ? '#AAA' : '#666' }]}>Tanggal</Text>
        <TouchableOpacity 
          style={[styles.input, styles.dateInput, { backgroundColor: isDark ? '#252525' : '#F9F9F9' }]} 
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
          <Text style={[styles.btnBatalText, { color: isDark ? '#AAA' : '#888' }]}>Batal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { 
    margin: 16, 
    padding: 24, 
    borderRadius: 20, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, 
    shadowRadius: 8 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 16, textTransform: 'uppercase' },
  tabContainer: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, borderWidth: 1 },
  tabMasuk: { backgroundColor: '#27ae60', borderColor: '#27ae60' },
  tabKeluar: { backgroundColor: '#e74c3c', borderColor: '#e74c3c' },
  tabText: { fontWeight: 'bold', fontSize: 14 },
  input: { padding: 14, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: 'transparent' },
  dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btnSimpan: { backgroundColor: '#2d9cdb', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 32 },
  btnSimpanText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnBatal: { marginTop: 16, alignItems: 'center', padding: 10 },
  btnBatalText: { fontSize: 14, fontWeight: '600' },
});

export default EditTransaksi;