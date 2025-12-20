import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { emit } from '../komponen/eventBus';
import { useTheme } from '../komponen/ThemeContext';

import { API_URL } from '../config'; // Import dari file config

const Inputan: React.FC<any> = ({ navigation }) => {
  const { theme } = useTheme(); // 🌙 DARK MODE
  const isDark = theme === 'dark';

  const [jumlah, setJumlah] = useState('');
  const [jenis, setJenis] = useState('Pemasukan');
  const [deskripsi, setDeskripsi] = useState('');
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

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
          jumlah,
          jenis,
          deskripsi,
          tanggal: date.toISOString(),
        }),
      });

      if (response.ok) {
        const baru = await response.json();
        try {
          emit('transaksi:created', baru);
        } catch (e) {}

        Alert.alert('Sukses', 'Transaksi berhasil disimpan!');
        setFeedbackMessage('Transaksi berhasil disimpan!');
        setJumlah('');
        setDeskripsi('');
        setDate(new Date());
        navigation.goBack();
      } else {
        const errorData = await response.json();
        Alert.alert(
          'Gagal',
          `Gagal menyimpan transaksi: ${
            errorData.error || response.statusText
          }`
        );
      }
    } catch (error) {
      console.error('Simpan Error:', error);
      Alert.alert(
        'Error',
        'Koneksi ke server gagal. Pastikan IP dan server berjalan.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setJumlah('');
    setDeskripsi('');
    setDate(new Date());
    setFeedbackMessage('');
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
      ]}
    >
      <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
        Jenis Transaksi
      </Text>

      <Picker
        selectedValue={jenis}
        style={[
          styles.input,
          { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', color: isDark ? '#FFFFFF' : '#000000' },
        ]}
        onValueChange={(itemValue: string) => setJenis(itemValue)}
      >
        <Picker.Item label="Pemasukan" value="Pemasukan" />
        <Picker.Item label="Pengeluaran" value="Pengeluaran" />
      </Picker>

      <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
        Jumlah (Rp)
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            color: isDark ? '#FFFFFF' : '#000000',
            borderColor: isDark ? '#333' : '#ccc',
          },
        ]}
        keyboardType="numeric"
        value={jumlah}
        onChangeText={setJumlah}
        placeholder="Contoh: 50000"
        placeholderTextColor={isDark ? '#888' : '#999'}
      />
      {!jumlah ? (
        <Text style={styles.errorText}>
          Jumlah harus diisi dan lebih dari 0.
        </Text>
      ) : null}

      <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
        Deskripsi
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            height: 100,
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            color: isDark ? '#FFFFFF' : '#000000',
            borderColor: isDark ? '#333' : '#ccc',
          },
        ]}
        multiline
        value={deskripsi}
        onChangeText={setDeskripsi}
        placeholder="Contoh: Gaji bulanan, Beli kopi"
        placeholderTextColor={isDark ? '#888' : '#999'}
      />

      <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
        Tanggal Transaksi
      </Text>

      <Button
        title={`Pilih Tanggal: ${date.toLocaleDateString()}`}
        onPress={() => setShowDatePicker(true)}
      />

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Button
        title={loading ? 'Menyimpan...' : 'Simpan Transaksi'}
        onPress={simpan}
        disabled={loading}
      />

      <View style={{ marginTop: 6 }}>
        <Button title="Reset Form" onPress={resetForm} color="#e74c3c" />
      </View>

      {feedbackMessage ? (
        <Text style={styles.feedbackText}>{feedbackMessage}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 10,
  },
  feedbackText: {
    color: '#27ae60',
    marginTop: 10,
    fontWeight: '600',
  },
});

export default Inputan;