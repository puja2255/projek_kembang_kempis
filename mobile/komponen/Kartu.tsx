// mobile/komponen/Kartu.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';

type Transaction = {
  jenis: string;
  tanggal: string;
  jumlah: number;
  deskripsi?: string | null;
  deskripsiTambahan?: string | null;
};

const Kartu: React.FC<{ transaksi: Transaction }> = ({ transaksi }) => {
  const [expanded, setExpanded] = useState(false);
  const isPemasukan = transaksi.jenis === 'Pemasukan';
  const warna = isPemasukan ? 'green' : 'red';

  const tanggal = new Date(transaksi.tanggal).toLocaleDateString('id-ID');
  // Format jumlah dengan pemisah ribuan
  const jumlah = transaksi.jumlah
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return (
    <View style={styles.kartu}>
      <View style={styles.detail}>
        <Text style={styles.deskripsi}>{transaksi.deskripsi || '-'}</Text>
        <Text style={styles.tanggal}>{tanggal}</Text>
      </View>
      <Text style={[styles.jumlah, { color: warna }]}>
        {isPemasukan ? '+' : '-'} Rp {jumlah}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  kartu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  detail: {
    flex: 1,
  },
  deskripsi: {
    fontSize: 16,
    fontWeight: '500',
  },
  tanggal: {
    fontSize: 12,
    color: '#666',
  },
  jumlah: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default Kartu;