import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { emit } from '../komponen/eventBus';
import { useTheme } from '../komponen/ThemeContext';
import { API_URL } from '../config';
import { getFormStyles } from '../styles/formStyles';

const Inputan: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const styles = getFormStyles(isDark);

  const [jumlah, setJumlah] = useState('');
  const [jenis, setJenis] = useState('Pemasukan');
  const [deskripsi, setDeskripsi] = useState('');
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const simpan = async () => {
    if (!jumlah || parseFloat(jumlah) <= 0) {
      Alert.alert('Error', 'Jumlah harus diisi dan lebih dari 0.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/transaksi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jumlah: parseFloat(jumlah),
          jenis,
          deskripsi,
          tanggal: date.toISOString(),
        }),
      });

      if (response.ok) {
        const baru = await response.json();
        try { emit('transaksi:created', baru); } catch (e) {}
        Alert.alert('Sukses', 'Transaksi berhasil disimpan!');
        router.back();
      } else {
        const errorData = await response.json();
        Alert.alert('Gagal', `Gagal: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Koneksi ke server gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView style={{ backgroundColor: isDark ? '#121212' : '#F5F7FA' }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.headerTitle}>Tambah Transaksi</Text>

          <Text style={styles.label}>Jenis</Text>
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
              onChangeText={(text) => setJumlah(text.replace(/[^0-9]/g, ''))}
              placeholder="0"
              placeholderTextColor={isDark ? '#444' : '#CCC'}
            />
          </View>

          <Text style={styles.label}>Tanggal</Text>
          <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
            <Text style={{ color: isDark ? '#FFF' : '#333' }}>
              {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
            <MaterialCommunityIcons name="calendar" size={20} color="#2d9cdb" />
          </TouchableOpacity>

          <Text style={styles.label}>Keterangan</Text>
          <View style={[styles.inputWrapper, styles.inputArea]}>
            <TextInput
              style={styles.input}
              multiline
              value={deskripsi}
              onChangeText={setDeskripsi}
              placeholder="Tulis catatan..."
              placeholderTextColor={isDark ? '#444' : '#CCC'}
            />
          </View>

          <TouchableOpacity style={[styles.btnSimpan, { opacity: loading ? 0.7 : 1 }]} onPress={simpan} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnSimpanText}>Simpan Transaksi</Text>}
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={(_, d) => { setShowDatePicker(false); if(d) setDate(d); }} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Inputan;