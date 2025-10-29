import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AntDesign } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Registro',
          tabBarIcon: ({ color }) => <AntDesign name="home" size={24} color="black" />
        }}
      />
      <Tabs.Screen
        name="QRScanner"
        options={{
          title: 'Escanear',
          tabBarIcon: ({ color }) => <AntDesign name="qrcode" size={24} color="black" />
        }}
      />
      <Tabs.Screen
        name="Mensualidades"
        options={{
          title: 'Mensualidades',
          tabBarIcon: ({ color }) => <AntDesign name="dollar" size={24} color="black" />
        }}
      />
      <Tabs.Screen
        name="Config"
        options={{
          title: 'Configuracion',
          tabBarIcon: ({ color }) => <AntDesign name="setting" size={24} color="black" />
        }}
      />
    </Tabs>
  );
}
