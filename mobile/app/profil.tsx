import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, Alert } from 'react-native';
import { useTheme } from '../komponen/ThemeContext';
import { Link } from 'expo-router';
import { getProfile, Profile } from '../komponen/profileStorage';

export default function Profil() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  if (!profile) return null;

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: isDark ? '#121212' : '#FFFFFF',
      }}
    >
      {/* Avatar & Info */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Image
          source={{ uri: profile.foto }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            marginBottom: 10,
          }}
        />

        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#FFF' : '#000',
          }}
        >
          {profile.nama}
        </Text>

        <Text style={{ color: '#888' }}>{profile.email}</Text>

        {profile.bio ? (
          <Text
            style={{
              textAlign: 'center',
              marginTop: 6,
              color: isDark ? '#CCC' : '#555',
            }}
          >
            {profile.bio}
          </Text>
        ) : null}
      </View>

      {/* Menu */}
      <Link href="/edit-profile" asChild>
        <MenuItem title="Edit Profil" />
      </Link>

      <MenuItem
        title="Logout"
        danger
        onPress={() =>
          Alert.alert('Logout', 'Yakin ingin logout?', [
            { text: 'Batal', style: 'cancel' },
            { text: 'Logout', style: 'destructive' },
          ])
        }
      />
    </View>
  );
}

/* ========================= */
/* Reusable Menu Item */
/* ========================= */
function MenuItem({
  title,
  danger,
  onPress,
}: {
  title: string;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 14,
        borderRadius: 10,
        backgroundColor: danger ? '#FFE5E5' : '#F2F2F2',
        marginBottom: 10,
      }}
    >
      <Text
        style={{
          color: danger ? 'red' : '#000',
          fontWeight: '600',
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}