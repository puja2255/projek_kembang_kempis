import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '../komponen/ThemeContext';
import { API_URL } from '../config';
import { getFormStyles } from '../styles/formStyles'; 

const EditTransaksi: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const styles = getFormStyles(isDark);

  const [jenis, setJenis] = useState<string>((params.jenis as string) || 'Pengeluaran');
  const [jumlah, setJumlah] = useState<string>((params.jumlah as string) || '');
  const [deskripsi, setDeskripsi] = useState<string>((params.deskripsi as string) || '');
  const [tanggal, setTanggal] = useState<Date>(params.tanggal ? new Date(params.tanggal as string) : new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!jumlah || !deskripsi) {
      Alert.alert('Peringatan', 'Isi data dengan lengkap!');
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
          deskripsi, // BERSIH DARI DESKRIPSI TAMBAHAN
          tanggal: tanggal.toISOString(),
        }),
      });
      if (response.ok) {
        Alert.alert('Berhasil', 'Data diperbarui!', [{ text: 'OK', onPress: () => router.replace('/') }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal update data.');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView style={{ backgroundColor: isDark ? '#121212' : '#F5F7FB' }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.headerTitle}>Edit Transaksi</Text>
          
          <Text style={styles.label}>Jenis</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity style={[styles.typeTab, jenis === 'Pemasukan' && styles.activeTabIn]} onPress={() => setJenis('Pemasukan')}>
              <Text style={[styles.typeText, { color: jenis === 'Pemasukan' ? '#FFF' : (isDark ? '#AAA' : '#666') }]}>Pemasukan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.typeTab, jenis === 'Pengeluaran' && styles.activeTabOut]} onPress={() => setJenis('Pengeluaran')}>
              <Text style={[styles.typeText, { color: jenis === 'Pengeluaran' ? '#FFF' : (isDark ? '#AAA' : '#666') }]}>Pengeluaran</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Jumlah (Rp)</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencyPrefix}>Rp</Text>
            <TextInput style={[styles.input, styles.inputLarge]} keyboardType="numeric" value={jumlah} onChangeText={setJumlah} />
          </View>

          <Text style={styles.label}>Deskripsi</Text>
          <View style={[styles.inputWrapper, styles.inputArea]}>
            <TextInput style={styles.input} value={deskripsi} onChangeText={setDeskripsi} multiline />
          </View>

          <Text style={styles.label}>Tanggal</Text>
          <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowPicker(true)}>
            <Text style={{ color: isDark ? '#FFF' : '#000' }}>{tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
            <MaterialCommunityIcons name="calendar" size={20} color="#2d9cdb" />
          </TouchableOpacity>

          {showPicker && <DateTimePicker value={tanggal} mode="date" display="default" onChange={(_, d) => { setShowPicker(false); if(d) setTanggal(d); }} />}

          <TouchableOpacity style={styles.btnSimpan} onPress={handleUpdate} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnSimpanText}>Simpan Perubahan</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnBatal} onPress={() => router.back()}>
            <Text style={styles.btnBatalText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditTransaksi;