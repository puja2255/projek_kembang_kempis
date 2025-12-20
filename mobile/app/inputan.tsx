// mobile/app/inputan.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { emit } from '../komponen/eventBus';
import { useTheme } from '../komponen/ThemeContext';
import { API_URL } from '../config';

const Inputan: React.FC<any> = ({ navigation }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
        navigation.goBack();
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

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F7FA' }]}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>Tambah Transaksi</Text>

        {/* --- TOGGLE JENIS (Pemasukan / Pengeluaran) --- */}
        <View style={[styles.typeContainer, { backgroundColor: isDark ? '#1E1E1E' : '#E0E4E8' }]}>
          <TouchableOpacity 
            style={[styles.typeTab, jenis === 'Pemasukan' && styles.activeTabIn]} 
            onPress={() => setJenis('Pemasukan')}
          >
            <Text style={[styles.typeText, jenis === 'Pemasukan' ? styles.whiteText : { color: isDark ? '#AAA' : '#666' }]}>Pemasukan</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeTab, jenis === 'Pengeluaran' && styles.activeTabOut]} 
            onPress={() => setJenis('Pengeluaran')}
          >
            <Text style={[styles.typeText, jenis === 'Pengeluaran' ? styles.whiteText : { color: isDark ? '#AAA' : '#666' }]}>Pengeluaran</Text>
          </TouchableOpacity>
        </View>

        {/* --- INPUT JUMLAH --- */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: isDark ? '#CCC' : '#555' }]}>Jumlah (Rp)</Text>
          <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1E1E1E' : '#FFF', borderColor: isDark ? '#333' : '#DDD' }]}>
             <Text style={[styles.currencyPrefix, { color: isDark ? '#00c853' : '#00c853' }]}>Rp</Text>
             <TextInput
                style={[styles.inputLarge, { color: isDark ? '#FFF' : '#000' }]}
                keyboardType="number-pad"
                value={jumlah}
                onChangeText={(text) => setJumlah(text.replace(/[^0-9]/g, ''))}
                placeholder="0"
                placeholderTextColor={isDark ? '#444' : '#CCC'}
              />
          </View>
        </View>

        {/* --- INPUT TANGGAL --- */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: isDark ? '#CCC' : '#555' }]}>Tanggal</Text>
          <TouchableOpacity 
            style={[styles.datePickerBtn, { backgroundColor: isDark ? '#1E1E1E' : '#FFF', borderColor: isDark ? '#333' : '#DDD' }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: isDark ? '#FFF' : '#333' }}>{date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
            <Text style={{ color: '#4a90e2' }}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* --- INPUT DESKRIPSI --- */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: isDark ? '#CCC' : '#555' }]}>Keterangan / Deskripsi</Text>
          <TextInput
            style={[styles.inputArea, { backgroundColor: isDark ? '#1E1E1E' : '#FFF', borderColor: isDark ? '#333' : '#DDD', color: isDark ? '#FFF' : '#333' }]}
            multiline
            numberOfLines={4}
            value={deskripsi}
            onChangeText={setDeskripsi}
            placeholder="Tulis catatan di sini..."
            placeholderTextColor={isDark ? '#555' : '#BBB'}
          />
        </View>

        {/* --- ACTION BUTTONS --- */}
        <TouchableOpacity 
          style={[styles.btnSimpan, { opacity: loading ? 0.7 : 1 }]} 
          onPress={simpan}
          disabled={loading}
        >
          <Text style={styles.btnSimpanText}>{loading ? 'Memproses...' : 'Simpan Transaksi'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.btnReset} 
          onPress={() => { setJumlah(''); setDeskripsi(''); setDate(new Date()); }}
        >
          <Text style={styles.btnResetText}>Kosongkan Form</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  headerTitle: { fontSize: 24, fontWeight: '800', marginBottom: 25, textAlign: 'center' },
  
  // Toggle Switch
  typeContainer: { flexDirection: 'row', borderRadius: 15, padding: 6, marginBottom: 30 },
  typeTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  typeText: { fontWeight: 'bold', fontSize: 15 },
  activeTabIn: { backgroundColor: '#00c853', elevation: 4, shadowColor: '#00c853', shadowOpacity: 0.3, shadowRadius: 5 },
  activeTabOut: { backgroundColor: '#e53935', elevation: 4, shadowColor: '#e53935', shadowOpacity: 0.3, shadowRadius: 5 },
  whiteText: { color: '#FFF' },

  // Inputs
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 15, paddingHorizontal: 15 },
  currencyPrefix: { fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  inputLarge: { flex: 1, paddingVertical: 15, fontSize: 22, fontWeight: 'bold' },
  datePickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderRadius: 15, padding: 15 },
  inputArea: { borderWidth: 1, borderRadius: 15, padding: 15, textAlignVertical: 'top', height: 100, fontSize: 16 },

  // Buttons
  btnSimpan: { backgroundColor: '#4a90e2', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 20, elevation: 5, shadowColor: '#4a90e2', shadowOpacity: 0.4, shadowRadius: 10 },
  btnSimpanText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  btnReset: { marginTop: 15, paddingVertical: 10, alignItems: 'center' },
  btnResetText: { color: '#888', fontSize: 14, fontWeight: '500' },
});

export default Inputan;