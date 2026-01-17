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

const EditTransaksi: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // --- STATE FORM (Inisialisasi dari params yang dikirim Home) ---
  const [jenis, setJenis] = useState<string>((params.jenis as string) || 'Pengeluaran');
  const [jumlah, setJumlah] = useState<string>((params.jumlah as string) || '');
  const [deskripsi, setDeskripsi] = useState<string>((params.deskripsi as string) || '');
  const [deskripsiTambahan, setDeskripsiTambahan] = useState<string>((params.deskripsiTambahan as string) || '');
  const [tanggal, setTanggal] = useState<Date>(
    params.tanggal ? new Date(params.tanggal as string) : new Date()
  );
  
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- FUNGSI UPDATE DATA KE BACKEND ---
  const handleUpdate = async () => {
    if (!jumlah || !deskripsi) {
      Alert.alert('Peringatan', 'Jumlah dan Deskripsi tidak boleh kosong!');
      return;
    }

    if (!params.id) {
      Alert.alert('Error', 'ID Transaksi tidak valid.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/transaksi/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis,
          jumlah: parseInt(jumlah),
          deskripsi,
          deskripsiTambahan,
          tanggal: tanggal.toISOString(),
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        Alert.alert('Berhasil', 'Transaksi diperbarui!', [
          { text: 'OK', onPress: () => router.replace('/') } 
        ]);
      } else {
        throw new Error(result.message || 'Gagal memperbarui data di server.');
      }
    } catch (error: any) {
      console.error('Update Error:', error);
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan koneksi ke server.');
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
        
        {/* Pilih Jenis */}
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
          placeholder="Masukkan deskripsi..."
          placeholderTextColor="#888"
        />

        {/* Input Deskripsi Tambahan */}
        <Text style={[styles.label, { color: isDark ? '#AAA' : '#666' }]}>Catatan (Opsional)</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#252525' : '#F9F9F9', color: isDark ? '#FFF' : '#000' }]}
          value={deskripsiTambahan}
          onChangeText={setDeskripsiTambahan}
          multiline
          numberOfLines={4}
          placeholder="Tambahkan catatan detail..."
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

        {/* Tombol Aksi */}
        <TouchableOpacity 
          style={[styles.btnSimpan, { opacity: loading ? 0.7 : 1 }]} 
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnSimpanText}>Perbarui Transaksi</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnBatal} onPress={() => router.back()}>
          <Text style={[styles.btnBatalText, { color: isDark ? '#AAA' : '#888' }]}>Kembali</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { 
    margin: 16, 
    padding: 20, 
    borderRadius: 20, 
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, 
    shadowRadius: 10 
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 15 },
  tabContainer: { flexDirection: 'row', gap: 10, marginBottom: 5 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, borderWidth: 1 },
  tabMasuk: { backgroundColor: '#27ae60', borderColor: '#27ae60' },
  tabKeluar: { backgroundColor: '#e74c3c', borderColor: '#e74c3c' },
  tabText: { fontWeight: 'bold', fontSize: 14 },
  input: { padding: 14, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: 'transparent' },
  textArea: { height: 100, textAlignVertical: 'top' },
  dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btnSimpan: { backgroundColor: '#2d9cdb', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 35, elevation: 3 },
  btnSimpanText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnBatal: { marginTop: 20, alignItems: 'center' },
  btnBatalText: { fontSize: 14, fontWeight: '600' },
});

export default EditTransaksi;