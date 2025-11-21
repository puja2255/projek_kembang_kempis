// mobile/layar/Inputan.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Picker } from 'react-native';

// *** GANTI DENGAN IP LOKAL KOMPUTER ANDA ***
const API_URL = 'http://192.168.1.10:3000'; 

const Inputan = ({ navigation }) => {
  const [jumlah, setJumlah] = useState('');
  const [jenis, setJenis] = useState('Pemasukan');
  const [deskripsi, setDeskripsi] = useState('');
  const [loading, setLoading] = useState(false);

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
        }),
      });

      if (response.ok) {
        Alert.alert('Sukses', 'Transaksi berhasil disimpan!');
        // Reset form
        setJumlah('');
        setDeskripsi('');
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

      <Text style={styles.label}>Deskripsi</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        value={deskripsi}
        onChangeText={setDeskripsi}
        placeholder="Contoh: Gaji bulanan, Beli kopi"
      />

      <Button title={loading ? "Menyimpan..." : "Simpan Transaksi"} onPress={simpan} disabled={loading} />
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
});

export default Inputan;