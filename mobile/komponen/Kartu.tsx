// mobile/komponen/Kartu.js

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatRupiah } from './tipe';

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
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, speed: 20 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  const tanggal = new Date(transaksi.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  const waktu = new Date(transaksi.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{ marginVertical: 6 }}
    >
      <Animated.View style={[styles.kartu, { transform: [{ scale }] }] }>
        <View style={styles.left}>
          <View style={[styles.iconWrap, { backgroundColor: isPemasukan ? '#eaf8f0' : '#fff2f1' }]}> 
            <MaterialCommunityIcons
              name={isPemasukan ? 'arrow-up-bold' : 'arrow-down-bold'}
              size={20}
              color={isPemasukan ? '#16a085' : '#c0392b'}
            />
          </View>
        </View>

        <View style={styles.detail}>
          <Text style={styles.deskripsi}>{transaksi.deskripsi || '-'}</Text>
          {transaksi.deskripsiTambahan && expanded && (
            <Text style={styles.deskripsiTambahan}>{transaksi.deskripsiTambahan}</Text>
          )}
          <View style={styles.dateRow}>
            <Text style={styles.tanggal}>{tanggal}</Text>
            <View style={styles.timeBadge}><Text style={styles.timeText}>{waktu}</Text></View>
          </View>
        </View>

        <View style={styles.right}>
          <View style={[styles.amountWrap, { backgroundColor: isPemasukan ? '#ecf9f3' : '#fff5f5' }]}>
            <Text style={[styles.jumlah, { color: isPemasukan ? '#0e7a53' : '#a72e2e' }]}> 
              {isPemasukan ? '+' : '-'} {formatRupiah(transaksi.jumlah)}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  kartu: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  left: {
    width: 40,
    alignItems: 'center',
  },
  detail: {
    flex: 1,
    paddingHorizontal: 8,
  },
  deskripsi: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  deskripsiTambahan: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timeBadge: {
    marginLeft: 8,
    backgroundColor: '#f1f4f8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  timeText: {
    fontSize: 11,
    color: '#6b7280',
  },
  tanggal: {
    fontSize: 12,
    color: '#666',
  },
  jumlah: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  right: {
    minWidth: 110,
    alignItems: 'flex-end',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountWrap: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
});

export default Kartu;