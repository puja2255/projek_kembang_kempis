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

const EditTransaksi = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // --- STATE FORM (Diisi otomatis dari params) ---
  const [jenis, setJenis] = useState<string>((params.jenis as string) || 'Pengeluaran');
  const [jumlah, setJumlah] = useState<string>((params.jumlah as string) || '');
  const [deskripsi, setDeskripsi] = useState<string>((params.deskripsi as string) || '');
  const [deskripsiTambahan, setDeskripsiTambahan] = useState<string>((params.deskripsiTambahan as string) || '');
  const [tanggal, setTanggal] = useState<Date>(params.tanggal ? new Date(params.tanggal as string) : new Date());
  
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- FUNGSI UPDATE DATA ---
  const handleUpdate = async () => {
    if (!jumlah || !deskripsi) {
      Alert.alert('Error', 'Jumlah dan Deskripsi harus diisi!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/transaksi/${params.id}`, {
        method: 'PUT', // Menggunakan PUT untuk update data
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis,
          jumlah: parseInt(jumlah),
          deskripsi,
          deskripsiTambahan,
          tanggal: tanggal.toISOString(),
        }),
      });