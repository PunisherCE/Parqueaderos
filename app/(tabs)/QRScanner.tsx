import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';

interface Vehicle {
  placa: string;
  type: 'carro' | 'moto';
  time: Date;
}

interface ParkingConfig {
  maxMotos: string;
  maxCarros: string;
  precioHoraMotos: string;
  precioHoraCarros: string;
  precioMesMotos: string;
  precioMesCarros: string;
}

export default function QRScanner() {

  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [parkingConfig, setParkingConfig] = React.useState<ParkingConfig>({
      maxMotos: '50',
      maxCarros: '30',
      precioHoraMotos: '2000',
      precioHoraCarros: '5000',
      precioMesMotos: '40000',
      precioMesCarros: '100000',
    });
  const [currentVehicleCounts, setCurrentVehicleCounts] = React.useState({
      motos: 0,
      carros: 0
    });

  const loadVehicleData = async () => {
    try {
      const vehiclesJson = await AsyncStorage.getItem('parqueaderosVehicles');
      const totalJson = await AsyncStorage.getItem('parqueaderosTotal');

      const rawVehicles = vehiclesJson ? JSON.parse(vehiclesJson) : [];
      // Convert string dates back to Date objects
      const vehicles = rawVehicles.map((v: any) => ({
        ...v,
        time: new Date(v.time)
      }));
      const totalData = totalJson ? JSON.parse(totalJson) : { total: 0 };

      return { vehicles, total: totalData.total };
    } catch (error) {
      console.error('Error loading data:', error);
      return { vehicles: [], total: 0 };
    }
  };

  const loadVehicleData2 = async () => {
    try {
      const vehiclesJson = await AsyncStorage.getItem('mensualidadesVehicles');
      const totalJson = await AsyncStorage.getItem('parqueaderosTotal');

      const rawVehicles = vehiclesJson ? JSON.parse(vehiclesJson) : [];
      // Convert string dates back to Date objects
      const vehicles = rawVehicles.map((v: any) => ({
        ...v,
        time: new Date(v.time)
      }));
      const totalData = totalJson ? JSON.parse(totalJson) : { total: 0 };

      return { vehicles, total: totalData.total };
    } catch (error) {
      console.error('Error loading data:', error);
      return { vehicles: [], total: 0 };
    }
  };

  const loadParkingConfig = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem('parkingConfig');
      if (savedConfig) {
        setParkingConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Error loading parking config:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadAllVehicles = async () => {
        try {
          // Load hourly vehicles
          const hourlyVehiclesJson = await AsyncStorage.getItem('parqueaderosVehicles');
          const hourlyVehicles = hourlyVehiclesJson ? JSON.parse(hourlyVehiclesJson) : [];
          
          // Count vehicles by type from both hourly and monthly
          const totalMotos = vehicles.filter(v => v.type === 'moto').length +
                            hourlyVehicles.filter((v: any) => v.type === 'moto').length;
          const totalCarros = vehicles.filter(v => v.type === 'carro').length +
                             hourlyVehicles.filter((v: any) => v.type === 'carro').length;

          setCurrentVehicleCounts({
            motos: totalMotos,
            carros: totalCarros
          });
        } catch (error) {
          console.error('Error loading vehicle counts:', error);
        }
      };

      loadAllVehicles();
    }, [vehicles])
  );
  
  useFocusEffect(
    React.useCallback(() => {
      const loadAllVehicles = async () => {
        try {
          // Load monthly vehicles
          const monthlyVehiclesJson = await AsyncStorage.getItem('mensualidadesVehicles');
          const monthlyVehicles = monthlyVehiclesJson ? JSON.parse(monthlyVehiclesJson) : [];
          
          // Count vehicles by type from both hourly and monthly
          const totalMotos = vehicles.filter(v => v.type === 'moto').length +
                            monthlyVehicles.filter((v: any) => v.type === 'moto').length;
          const totalCarros = vehicles.filter(v => v.type === 'carro').length +
                             monthlyVehicles.filter((v: any) => v.type === 'carro').length;

          setCurrentVehicleCounts({
            motos: totalMotos,
            carros: totalCarros
          });
        } catch (error) {
          console.error('Error loading vehicle counts:', error);
        }
      };

      loadAllVehicles();
    }, [vehicles])
  ); // Update whenever vehicles changes


  return (
    <View style={styles.container}>
      <StatusBar 
              barStyle={"light-content"}
              translucent={true} 
              backgroundColor="transparent"/>
      <Text style={styles.text}>QR Scanner Component is currently disabled.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: StatusBar.currentHeight! + 5,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});