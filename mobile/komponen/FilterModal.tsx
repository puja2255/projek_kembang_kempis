import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from './ThemeContext';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  // Filter Jenis Transaksi (Opsional, karena di Laporan tidak pakai)
  filterJenis?: 'Semua' | 'Pemasukan' | 'Pengeluaran';
  onFilterJenisChange?: (jenis: 'Semua' | 'Pemasukan' | 'Pengeluaran') => void;
  // Filter Waktu
  modeWaktu: 'Semua' | 'Hari' | 'Bulan' | 'Tahun';
  onModeWaktuChange: (mode: 'Semua' | 'Hari' | 'Bulan' | 'Tahun') => void;
  tanggal: Date;
  onTanggalChange: (date: Date) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible, onClose, filterJenis, onFilterJenisChange,
  modeWaktu, onModeWaktuChange, tanggal, onTanggalChange
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showPicker, setShowPicker] = React.useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) onTanggalChange(selectedDate);
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#333' }]}>Pengaturan Filter</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={isDark ? '#888' : '#666'} />
            </TouchableOpacity>
          </View>

          {/* Bagian Tipe Transaksi (Hanya muncul jika props dikirim) */}
          {onFilterJenisChange && (
            <>
              <Text style={[styles.modalSubTitle, { color: isDark ? '#AAA' : '#666' }]}>Tipe Transaksi</Text>
              <div style={styles.modalModeRow}>
                {(['Semua', 'Pemasukan', 'Pengeluaran'] as const).map((t) => (
                  <TouchableOpacity key={t} onPress={() => onFilterJenisChange(t)}
                    style={[styles.modeBtn, filterJenis === t && styles.modeBtnActive]}>
                    <Text style={[styles.modeBtnText, filterJenis === t && { color: '#FFF' }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </div>
              <View style={styles.separator} />
            </>
          )}

          <Text style={[styles.modalSubTitle, { color: isDark ? '#AAA' : '#666' }]}>Rentang Waktu</Text>
          <View style={styles.modalModeRow}>
            {(['Semua', 'Hari', 'Bulan', 'Tahun'] as const).map((m) => (
              <TouchableOpacity key={m} onPress={() => onModeWaktuChange(m)}
                style={[styles.modeBtn, modeWaktu === m && styles.modeBtnActive]}>
                <Text style={[styles.modeBtnText, modeWaktu === m && { color: '#FFF' }]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {modeWaktu !== 'Semua' && (
            <TouchableOpacity style={[styles.dateSelector, { backgroundColor: isDark ? '#222' : '#f9f9f9' }]} onPress={() => setShowPicker(true)}>
              <MaterialCommunityIcons name="calendar" size={20} color="#2d9cdb" />
              <Text style={{ marginLeft: 10, color: isDark ? '#FFF' : '#333' }}>
                {tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
            <Text style={styles.applyBtnText}>Terapkan Filter</Text>
          </TouchableOpacity>
        </View>
      </View>
      {showPicker && <DateTimePicker value={tanggal} mode="date" display="default" onChange={handleDateChange} />}
    </Modal>
  );
};

// ... copy styles dari Modal Home kamu ...
const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', padding: 20, borderRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalSubTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  modalModeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  modeBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  modeBtnActive: { backgroundColor: '#2d9cdb', borderColor: '#2d9cdb' },
  modeBtnText: { fontSize: 12, color: '#666', fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  dateSelector: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginTop: 10 },
  applyBtn: { marginTop: 20, backgroundColor: '#2d9cdb', padding: 15, borderRadius: 12, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default FilterModal;