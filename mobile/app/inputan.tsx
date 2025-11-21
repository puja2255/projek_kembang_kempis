import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Picker } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// *** GANTI DENGAN IP LOKAL KOMPUTER ANDA ***
const API_URL = 'http://192.168.1.10:3000'; 

const Inputan = ({ navigation }) => {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jumlah: jumlah,
          jenis: jenis,
          deskripsi: deskripsi,
          tanggal: date.toISOString(),
        }),
      });

      if (response.ok) {
        Alert.alert('Sukses', 'Transaksi berhasil disimpan!');
        setFeedbackMessage('Transaksi berhasil disimpan!');
        // Reset form
        setJumlah('');
        setDeskripsi('');
        setDate(new Date());
        navigation.goBack(); 
      } else {
        const errorData = await response.json();
        Alert.alert('Gagal', `Gagal menyimpan transaksi: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error("Simpan Error:", error);
      Alert.alert('Error', 'Koneksi ke server gagal. Pastikan IP dan server berjalan.');
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

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Jenis Transaksi</Text>
      <Picker
        selectedValue={jenis}
        style={styles.input}
        onValueChange={(itemValue) => setJenis(itemValue)}
      >
        <Picker.Item label="Pemasukan" value="Pemasukan" />
        <Picker.Item label="Pengeluaran" value="Pengeluaran" />
      </Picker>

      <Text style={styles.label}>Jumlah (Rp)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={jumlah}
        onChangeText={setJumlah}
        placeholder="Contoh: 50000"
      />
      {!jumlah ? <Text style={styles.errorText}>Jumlah harus diisi dan lebih dari 0.</Text> : null}

      <Text style={styles.label}>Deskripsi</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        value={deskripsi}
        onChangeText={setDeskripsi}
        placeholder="Contoh: Gaji bulanan, Beli kopi"
      />

      <Text style={styles.label}>Tanggal Transaksi</Text>
      <Button title={`Pilih Tanggal: ${date.toLocaleDateString()}`} onPress={showDatepicker} />

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Button title={loading ? "Menyimpan..." : "Simpan Transaksi"} onPress={simpan} disabled={loading} />
      <Button title="Reset Form" onPress={resetForm} color="#f00" />

      {feedbackMessage ? <Text style={styles.feedbackText}>{feedbackMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  feedbackText: {
    color: 'green',
    marginTop: 10,
  },
});

export default Inputan;