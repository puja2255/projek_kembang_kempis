import AsyncStorage from '@react-native-async-storage/async-storage';

export type Profile = {
  nama: string;
  email: string;
  bio: string;
  foto: string;
};

const KEY = 'USER_PROFILE';

export const defaultProfile: Profile = {
  nama: 'Pengguna',
  email: 'user@email.com',
  bio: 'Pengguna aplikasi pencatatan keuangan',
  foto: 'https://i.pravatar.cc/150',
};

export async function getProfile(): Promise<Profile> {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : defaultProfile;
}

export async function saveProfile(profile: Profile) {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
}