// mobile/App.js

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './layar/Home';
import Inputan from './layar/Inputan';
import Laporan from './layar/Laporan'; 

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} options={{ title: 'Kembang Kempis' }} />
        <Stack.Screen name="Inputan" component={Inputan} options={{ title: 'Tambah Transaksi' }} />
        <Stack.Screen name="Laporan" component={Laporan} options={{ title: 'Laporan Grafis' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}