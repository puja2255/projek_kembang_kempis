import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useTheme } from '../komponen/ThemeContext';
import { getProfile, saveProfile, Profile } from '../komponen/profileStorage';

export default function EditProfil() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  if (!profile) return null;

  /* =========================
     Pilih Foto dari Galeri
  ========================== */
  const pilihFoto = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Izin ditolak', 'Akses galeri diperlukan');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!res.canceled) {
      setProfile({ ...profile, foto: res.assets[0].uri });
    }
  };

  /* =========================
     Simpan Perubahan
  ========================== */
  const simpan = async () => {
    await saveProfile(profile);
    Alert.alert('Berhasil', 'Profil berhasil diperbarui');
    router.back();
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: isDark ? '#121212' : '#FFFFFF',
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 16,
          color: isDark ? '#FFF' : '#000',
        }}
      >
        Edit Profil
      </Text>

      {/* Foto Profil */}
      <Image
        source={{ uri: profile.foto }}
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          alignSelf: 'center',
          marginBottom: 10,
        }}
      />
      <Button title="Ganti Foto" onPress={pilihFoto} />

      {/* Input Nama */}
      <TextInput
        value={profile.nama}
        onChangeText={(v) => setProfile({ ...profile, nama: v })}
        placeholder="Nama"
        placeholderTextColor={isDark ? '#888' : '#999'}
        style={[
          styles.input,
          { color: isDark ? '#FFF' : '#000', borderBottomColor: isDark ? '#444' : '#CCC' },
        ]}
      />

      {/* Input Email */}
      <TextInput
        value={profile.email}
        onChangeText={(v) => setProfile({ ...profile, email: v })}
        placeholder="Email"
        placeholderTextColor={isDark ? '#888' : '#999'}
        style={[
          styles.input,
          { color: isDark ? '#FFF' : '#000', borderBottomColor: isDark ? '#444' : '#CCC' },
        ]}
      />

      {/* Bio */}
      <TextInput
        value={profile.bio}
        onChangeText={(v) => setProfile({ ...profile, bio: v })}
        placeholder="Bio"
        placeholderTextColor={isDark ? '#888' : '#999'}
        multiline
        style={[
          styles.input,
          {
            height: 80,
            textAlignVertical: 'top',
            color: isDark ? '#FFF' : '#000',
            borderBottomColor: isDark ? '#444' : '#CCC',
          },
        ]}
      />

      <Button title="Simpan Perubahan" onPress={simpan} />
    </View>
  );
}

const styles = {
  input: {
    borderBottomWidth: 1,
    marginBottom: 16,
    paddingVertical: 6,
  },
};