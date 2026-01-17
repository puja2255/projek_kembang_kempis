import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router'; // Gunakan router jika expo
import DateTimePicker from '@react-native-community/datetimepicker';
import { emit } from '../komponen/eventBus';
import { useTheme } from '../komponen/ThemeContext';
import { API_URL } from '../config';
import { getFormStyles } from '../styles/formStyles'; // Import style

const Inputan: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const styles = getFormStyles(isDark);

  const [jumlah, setJumlah] = useState('');
  const [jenis, setJenis] = useState('Pemasukan');
  const [deskripsi, setDeskripsi] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const simpan = async () => {
    if (!jumlah || !deskripsi) return Alert.alert('Error', 'Data belum lengkap');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/transaksi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jumlah: parseFloat(jumlah), jenis, deskripsi, tanggal: date.toISOString() }),
      });
      if (response.ok) {
        const baru = await response.json();
        emit('transaksi:created', baru);
        router.back();
      }
    } catch (e) { Alert.alert('Error', 'Koneksi gagal'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} style={{ backgroundColor: isDark ? '#121212' : '#F5F7FA' }}>
        <View style={styles.card}>
          <Text style={styles.headerTitle}>Tambah Transaksi</Text>

          <Text style={styles.label}>Jenis Transaksi</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity 
              style={[styles.typeTab, jenis === 'Pemasukan' && styles.activeTabIn]} 
              onPress={() => setJenis('Pemasukan')}
            >
              <Text style={[styles.typeText, { color: jenis === 'Pemasukan' ? '#FFF' : (isDark ? '#AAA' : '#666') }]}>Pemasukan</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeTab, jenis === 'Pengeluaran' && styles.activeTabOut]} 
              onPress={() => setJenis('Pengeluaran')}
            >
              <Text style={[styles.typeText, { color: jenis === 'Pengeluaran' ? '#FFF' : (isDark ? '#AAA' : '#666') }]}>Pengeluaran</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Jumlah (Rp)</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencyPrefix}>Rp</Text>
            <TextInput 
              style={[styles.input, styles.inputLarge]} 
              keyboardType="number-pad" 
              value={jumlah} 
              onChangeText={setJumlah} 
              placeholder="0" 
              placeholderTextColor="#555"
            />
          </View>

          <Text style={styles.label}>Keterangan</Text>
          <TextInput 
            style={[styles.inputWrapper, styles.input, styles.inputArea]} 
            multiline 
            value={deskripsi} 
            onChangeText={setDeskripsi} 
            placeholder="Tulis deskripsi..."
          />

          <TouchableOpacity style={styles.btnSimpan} onPress={simpan} disabled={loading}>
            <Text style={styles.btnSimpanText}>{loading ? 'Memproses...' : 'Simpan Transaksi'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Inputan;