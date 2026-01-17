import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
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
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/transaksi`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json: Transaksi[] = await response.json();
      setData(Array.isArray(json) && json.length > 0 ? json : MOCK_DATA);
    } catch (error) {
      console.error('Gagal mengambil data:', error);
      Alert.alert(
        'Koneksi Gagal',
        'Pastikan server backend berjalan dan IP Address sudah benar.'
      );
      setData(MOCK_DATA);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- FITUR EDIT: Navigasi ke inputan dengan membawa data ---
  const editTransaksi = (item: Transaksi) => {
    router.push({
      pathname: '/edit-transaksi',
      params: { 
        id: item.id,
        jenis: item.jenis,
        jumlah: item.jumlah.toString(),
        deskripsi: item.deskripsi,
        tanggal: item.tanggal,
        deskripsiTambahan: item.deskripsiTambahan || ''
      }
    });
  };

  // --- FITUR HAPUS: Menghapus data dari server dan state lokal ---
  const hapusTransaksi = (id: string) => {
    Alert.alert(
      'Hapus Transaksi',
      'Apakah Anda yakin ingin menghapus transaksi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/transaksi/${id}`, {
                method: 'DELETE',
              });
              if (response.ok) {
                setData((prev) => prev.filter((item) => item.id !== id));
              } else {
                throw new Error('Gagal hapus');
              }
            } catch (error) {
              // Tetap hapus di lokal jika gagal koneksi (untuk Mock Data)
              setData((prev) => prev.filter((item) => item.id !== id));
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      ambilData();
      return () => {};
    }, [])
  );

  useEffect(() => {
    const unsub = busOn('transaksi:created', (item: Transaksi) => {
      if (!item) return;
      setData((prev) => [item, ...prev]);
    });
    return () => unsub();
  }, []);

  const MOCK_DATA: Transaksi[] = [
    {
      id: 'mock-1',
      jenis: 'Pemasukan',
      jumlah: 150000,
      tanggal: new Date().toISOString(),
      deskripsi: 'Mock: Gaji bulanan',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mock-2',
      jenis: 'Pengeluaran',
      jumlah: 45000,
      tanggal: new Date().toISOString(),
      deskripsi: 'Mock: Makan siang',
      createdAt: new Date().toISOString(),
    },
  ];

  const saldo: number = data.reduce((acc, trans) => {
    return trans.jenis === 'Pemasukan'
      ? acc + trans.jumlah
      : acc - trans.jumlah;
  }, 0);

  const onRefresh = () => {
    setRefreshing(true);
    ambilData();
  };

  const isDark = theme === 'dark';

  const handleConfirmDate = (event: any, date?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date) {
      setTanggalPilihan(date);
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = (item.deskripsi || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJenis = filterJenis === 'Semua' || item.jenis === filterJenis;
    
    const tglItem = new Date(item.tanggal);
    let matchesWaktu = true;

    if (modeFilterWaktu === 'Hari') {
      matchesWaktu = tglItem.toDateString() === tanggalPilihan.toDateString();
    } else if (modeFilterWaktu === 'Bulan') {
      matchesWaktu = tglItem.getMonth() === tanggalPilihan.getMonth() && 
                     tglItem.getFullYear() === tanggalPilihan.getFullYear();
    } else if (modeFilterWaktu === 'Tahun') {
      matchesWaktu = tglItem.getFullYear() === tanggalPilihan.getFullYear();
    }

    return matchesSearch && matchesJenis && matchesWaktu;
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#F5F7FB' },
      ]}
    >
      {/* Saldo */}
      <View
        style={[
          styles.balanceCard,
          { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
        ]}
      >
        <Text style={[styles.balanceLabel, { color: isDark ? '#AAAAAA' : '#777' }]}>Saldo Saat Ini</Text>
        <Text style={[styles.balanceValue, { color: saldo >= 0 ? '#27ae60' : '#e74c3c' }]}>
          Rp {formatRupiah(saldo)}
        </Text>
      </View>

      {/* Tombol Utama */}
      <View style={styles.tombolContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/inputan')}>
          <Text style={styles.primaryButtonText}>Tambah Transaksi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', borderColor: isDark ? '#333' : '#e6e9ee' },
          ]}
          onPress={() => router.push('/laporan')}
        >
          <Text style={[styles.secondaryButtonText, { color: isDark ? '#FFFFFF' : '#333' }]}>Lihat Laporan</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar Row */}
      <View style={styles.searchRow}>
        <TextInput
          style={[
            styles.searchBar,
            {
              flex: 1,
              backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
              color: isDark ? '#FFFFFF' : '#000000',
              borderColor: isDark ? '#333' : '#ccc',
            },
          ]}
          placeholder="Cari transaksi..."
          placeholderTextColor={isDark ? '#888' : '#999'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: (modeFilterWaktu !== 'Semua' || filterJenis !== 'Semua') ? '#2d9cdb' : (isDark ? '#1E1E1E' : '#fff') }]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons 
            name="tune-vertical" 
            size={24} 
            color={(modeFilterWaktu !== 'Semua' || filterJenis !== 'Semua') ? '#fff' : (isDark ? '#aaa' : '#666')} 
          />
        </TouchableOpacity>
      </View>

      {/* Label Info Filter Aktif */}
      {(modeFilterWaktu !== 'Semua' || filterJenis !== 'Semua') && (
        <View style={styles.activeFilterLabel}>
          <Text style={{ color: '#2d9cdb', fontSize: 12, fontWeight: '700' }}>
            Filter: {filterJenis} | {modeFilterWaktu === 'Semua' ? 'Semua Waktu' : 
                                    modeFilterWaktu === 'Hari' ? tanggalPilihan.toLocaleDateString('id-ID') : 
                                    modeFilterWaktu === 'Bulan' ? tanggalPilihan.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 
                                    tanggalPilihan.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => { setModeFilterWaktu('Semua'); setFilterJenis('Semua'); }}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#e74c3c" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL POP-UP GABUNGAN */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#333' }]}>Pengaturan Filter</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={isDark ? '#888' : '#666'} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubTitle, { color: isDark ? '#AAA' : '#666' }]}>Tipe Transaksi</Text>
            <View style={styles.modalModeRow}>
              {(['Semua', 'Pemasukan', 'Pengeluaran'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setFilterJenis(t)}
                  style={[styles.modeBtn, filterJenis === t && styles.modeBtnActive]}
                >
                  <Text style={[styles.modeBtnText, filterJenis === t && { color: '#FFF' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.separator} />

            <Text style={[styles.modalSubTitle, { color: isDark ? '#AAA' : '#666' }]}>Rentang Waktu</Text>
            <View style={styles.modalModeRow}>
              {(['Semua', 'Hari', 'Bulan', 'Tahun'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setModeFilterWaktu(m)}
                  style={[styles.modeBtn, modeFilterWaktu === m && styles.modeBtnActive]}
                >
                  <Text style={[styles.modeBtnText, modeFilterWaktu === m && { color: '#FFF' }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {modeFilterWaktu !== 'Semua' && (
              <>
                <Text style={[styles.modalSubTitle, { color: isDark ? '#AAA' : '#666', marginTop: 15 }]}>Pilih Detail Waktu</Text>
                <TouchableOpacity 
                  style={[styles.dateSelector, { backgroundColor: isDark ? '#222' : '#f9f9f9' }]} 
                  onPress={() => setShowPicker(true)}
                >
                  <MaterialCommunityIcons name="calendar" size={20} color="#2d9cdb" />
                  <Text style={{ marginLeft: 10, color: isDark ? '#FFF' : '#333' }}>
                    {tanggalPilihan.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.applyBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.applyBtnText}>Terapkan Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showPicker && (
        <DateTimePicker value={tanggalPilihan} mode="date" display="default" onChange={handleConfirmDate} />
      )}

      <Text style={[styles.judulList, { color: isDark ? '#FFFFFF' : '#000000' }]}>Daftar Transaksi</Text>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2d9cdb" />
      ) : (
        <ScrollView
          style={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Kartu 
                key={item.id} 
                transaksi={item} 
                onDelete={() => hapusTransaksi(item.id)}
                onEdit={() => editTransaksi(item)}
              />
            ))
          ) : (
            <Text style={[styles.emptyText, { color: isDark ? '#AAAAAA' : '#666' }]}>Data tidak ditemukan.</Text>
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/inputan')}>
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  balanceCard: { padding: 16, borderRadius: 12, alignItems: 'center', marginVertical: 10, elevation: 3 },
  balanceLabel: { fontSize: 14 },
  balanceValue: { fontSize: 26, fontWeight: '700', marginTop: 6 },
  tombolContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
  primaryButton: { flex: 1, backgroundColor: '#2d9cdb', paddingVertical: 12, marginRight: 8, borderRadius: 10, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { flex: 1, paddingVertical: 12, marginLeft: 8, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  secondaryButtonText: { fontWeight: '700' },
  searchRow: { flexDirection: 'row', marginBottom: 10 },
  searchBar: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, borderWidth: 1 },
  filterButton: { marginLeft: 10, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center' },
  activeFilterLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingLeft: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', padding: 20, borderRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalSubTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  modalModeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modeBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  modeBtnActive: { backgroundColor: '#2d9cdb', borderColor: '#2d9cdb' },
  modeBtnText: { fontSize: 12, color: '#666', fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  dateSelector: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
  applyBtn: { marginTop: 25, backgroundColor: '#2d9cdb', padding: 15, borderRadius: 12, alignItems: 'center', elevation: 2 },
  applyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  judulList: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  list: { flex: 1 },
  emptyText: { textAlign: 'center', marginTop: 30 },
  fab: { position: 'absolute', right: 18, bottom: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#2d9cdb', alignItems: 'center', justifyContent: 'center', elevation: 6 },
});

export default Home;