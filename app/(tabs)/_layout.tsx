import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AntDesign } from '@expo/vector-icons'
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
          title: 'Escanear QR',
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
    </Tabs>
  );
}
