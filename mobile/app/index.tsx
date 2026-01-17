import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl,
  Alert, TouchableOpacity, TextInput, Platform, Modal,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Kartu from '../komponen/Kartu';
import { useTheme } from '../komponen/ThemeContext';
import { Transaksi, formatRupiah } from '../komponen/tipe';
import { on as busOn } from '../komponen/eventBus';
import { API_URL } from '../config';

const Home: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [data, setData] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(''); 
  
  const [modalVisible, setModalVisible] = useState(false);
  const [filterJenis, setFilterJenis] = useState<'Semua' | 'Pemasukan' | 'Pengeluaran'>('Semua');
  const [modeFilterWaktu, setModeFilterWaktu] = useState<'Semua' | 'Hari' | 'Bulan' | 'Tahun'>('Semua');
  const [tanggalPilihan, setTanggalPilihan] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const ambilData = async () => {
    try {
      const response = await fetch(`${API_URL}/transaksi`);
      const json: Transaksi[] = await response.json();
      setData(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error('Gagal mengambil data:', error);
      Alert.alert('Koneksi Gagal', 'Gagal menyambung ke server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(React.useCallback(() => { ambilData(); }, []));

  useEffect(() => {
    const unsub = busOn('transaksi:created', (item: Transaksi) => {
      if (item) setData((prev) => [item, ...prev]);
    });
    return () => unsub();
  }, []);

  const hapusTransaksi = (id: string) => {
    Alert.alert('Hapus', 'Yakin ingin menghapus?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
          await fetch(`${API_URL}/transaksi/${id}`, { method: 'DELETE' });
          setData((prev) => prev.filter((item) => item.id !== id));
      }},
    ]);
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = (item.deskripsi || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJenis = filterJenis === 'Semua' || item.jenis === filterJenis;
    const tglItem = new Date(item.tanggal);
    let matchesWaktu = true;

    if (modeFilterWaktu === 'Hari') matchesWaktu = tglItem.toDateString() === tanggalPilihan.toDateString();
    else if (modeFilterWaktu === 'Bulan') matchesWaktu = tglItem.getMonth() === tanggalPilihan.getMonth() && tglItem.getFullYear() === tanggalPilihan.getFullYear();
    else if (modeFilterWaktu === 'Tahun') matchesWaktu = tglItem.getFullYear() === tanggalPilihan.getFullYear();

    return matchesSearch && matchesJenis && matchesWaktu;
  });

  const saldo = data.reduce((acc, trans) => trans.jenis === 'Pemasukan' ? acc + trans.jumlah : acc - trans.jumlah, 0);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F7FB' }]}>
      {/* Saldo Card */}
      <View style={[styles.balanceCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
        <Text style={{ color: isDark ? '#AAA' : '#777' }}>Saldo Saat Ini</Text>
        <Text style={[styles.balanceValue, { color: saldo >= 0 ? '#27ae60' : '#e74c3c' }]}>
          Rp {formatRupiah(saldo)}
        </Text>
      </View>

      {/* Baris Pencarian & Filter */}
      <View style={styles.searchRow}>
        <TextInput 
          style={[styles.searchBar, { flex: 1, backgroundColor: isDark ? '#1E1E1E' : '#FFF', color: isDark ? '#FFF' : '#000' }]} 
          placeholder="Cari transaksi..." value={searchQuery} onChangeText={setSearchQuery} 
        />
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: (modeFilterWaktu !== 'Semua' || filterJenis !== 'Semua') ? '#2d9cdb' : (isDark ? '#1E1E1E' : '#fff') }]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons name="tune-vertical" size={24} color={(modeFilterWaktu !== 'Semua' || filterJenis !== 'Semua') ? '#fff' : '#666'} />
        </TouchableOpacity>
      </View>

      {/* List Transaksi */}
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={ambilData} />}>
        {loading ? <ActivityIndicator size="large" /> : filteredData.map((item) => (
          <Kartu key={item.id} transaksi={item} onDelete={() => hapusTransaksi(item.id)} onEdit={() => router.push({ pathname: '/edit-transaksi', params: item as any })} />
        ))}
      </ScrollView>

      {/* Modal Filter */}
      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#333' }]}>Filter Transaksi</Text>
            <View style={styles.modalModeRow}>
              {['Semua', 'Pemasukan', 'Pengeluaran'].map((t) => (
                <TouchableOpacity key={t} onPress={() => setFilterJenis(t as any)} style={[styles.modeBtn, filterJenis === t && styles.modeBtnActive]}>
                  <Text style={[styles.modeBtnText, filterJenis === t && { color: '#FFF' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.applyBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.applyBtnText}>Terapkan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/inputan')}>
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  balanceCard: { padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 15, elevation: 4 },
  balanceValue: { fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  searchBar: { borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#ddd' },
  filterButton: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 20, borderRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  modalModeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  modeBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#2d9cdb', borderColor: '#2d9cdb' },
  modeBtnText: { fontSize: 12, fontWeight: '600' },
  applyBtn: { backgroundColor: '#2d9cdb', padding: 15, borderRadius: 10, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: 'bold' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2d9cdb', justifyContent: 'center', alignItems: 'center', elevation: 5 },
});

export default Home;