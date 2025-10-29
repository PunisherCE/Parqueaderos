import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import { Barcode } from 'expo-barcode-generator';
import * as Print from 'expo-print';
import React, { useRef } from 'react';
import { Alert, FlatList, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import ViewShot from "react-native-view-shot";



function isAlphabetic(str: string): boolean {
  return /^[A-Za-z]+$/.test(str);
}

function isNumericSlice(str: string, start: number, end: number): boolean {
  const slice = str.slice(start, end);
  return /^\d+$/.test(slice);
}


interface ParkingConfig {
  maxMotos: string;
  maxCarros: string;
  precioHoraMotos: string;
  precioHoraCarros: string;
  precioMesMotos: string;
  precioMesCarros: string;
}

interface Vehicle {
  placa: string;
  type: 'carro' | 'moto';
  time: Date;
}

export default function HomeScreen() {
  const [placa, setPlaca] = React.useState<string>('');
  const [filteredVehicles, setFilteredVehicles] = React.useState<Vehicle[]>([]);
  const [buttonOneBoolean, setButtonOneBoolean] = React.useState<boolean>(false);
  const [buttonTwoBoolean, setButtonTwoBoolean] = React.useState<boolean>(false);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [isPrinting, setIsPrinting] = React.useState<boolean>(false);
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

  const barcodeRef = useRef<ViewShot>(null);

  // Track total vehicles across both hourly and monthly parking
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



  // Update useEffect to use vehicles state instead of dummyVehicles
  React.useEffect(() => {
    const filtered = vehicles.filter((vehicle) =>
      vehicle.placa.toLowerCase().includes(placa.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [placa, vehicles]);

  React.useEffect(() => {
    if (placa.length >= 6) {
      const vehicleExists = vehicles.some(v => v.placa === placa);
      setButtonOneBoolean(!vehicleExists);
      setButtonTwoBoolean(vehicleExists);
    } else {
      setButtonOneBoolean(false);
      setButtonTwoBoolean(false);
    }
  }, [placa, vehicles]);

  async function handleSubmit() {
    // Create date with local timezone offset
    const now = new Date();
    const currentTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    let type: 'carro' | 'moto';
    
    if (isAlphabetic(placa[6]) || placa.length === 6) {
      type = 'moto';
      if (currentVehicleCounts.motos >= parseInt(parkingConfig.maxMotos)) {
        Alert.alert('Error', 
          `Se alcanzó el límite de motos en el parqueadero\n` +
          `Total actual: ${currentVehicleCounts.motos}\n` +
          `Límite: ${parkingConfig.maxMotos}`
        );
        return;
      }
    } else {
      type = 'carro';
      if (currentVehicleCounts.carros >= parseInt(parkingConfig.maxCarros)) {
        Alert.alert('Error', 
          `Se alcanzó el límite de carros en el parqueadero\n` +
          `Total actual: ${currentVehicleCounts.carros}\n` +
          `Límite: ${parkingConfig.maxCarros}`
        );
        return;
      }
    }

    const logEntry: Vehicle = {
      placa,
      type,
      time: currentTime
    };

    try {
      // First print the barcode while we still have the placa value
      await printBarcode();
      
      // Only after successful printing, update the state
      setVehicles(prevVehicles => [logEntry, ...prevVehicles]);
      setPlaca('');
      await saveVehicleData([logEntry, ...vehicles], 0);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert('Error', 'Hubo un problema al registrar el vehículo');
    }
  }

  function handleSubmit2(){
    // Create date with local timezone offset
    const now = new Date();
    const currentTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    let type: 'carro' | 'moto';
    
    if (isAlphabetic(placa[6]) || placa.length === 6) {
      type = 'moto';
      if (currentVehicleCounts.motos >= parseInt(parkingConfig.maxMotos)) {
        Alert.alert('Error', 
          `Se alcanzó el límite de motos en el parqueadero\n` +
          `Total actual: ${currentVehicleCounts.motos}\n` +
          `Límite: ${parkingConfig.maxMotos}`
        );
        return;
      }
    } else {
      type = 'carro';
      if (currentVehicleCounts.carros >= parseInt(parkingConfig.maxCarros)) {
        Alert.alert('Error', 
          `Se alcanzó el límite de carros en el parqueadero\n` +
          `Total actual: ${currentVehicleCounts.carros}\n` +
          `Límite: ${parkingConfig.maxCarros}`
        );
        return;
      }
    }

    const logEntry: Vehicle = {
      placa,
      type,
      time: currentTime
    };

    setVehicles(prevVehicles => [logEntry, ...prevVehicles]);
    setPlaca('');
    saveVehicleData([logEntry, ...vehicles], 0);
  }

  function placaHandler(text: string) {
    if (text.length === 0) {
      setPlaca('');
      return;
    }
    if (text.length > 0 && text.length < 4) {
      if (isAlphabetic(text)){
        setPlaca(text.toUpperCase());
        // Only add hyphen if we're typing forward, not deleting
        if (text.length === 3 && text.length > placa.length) {
          setPlaca(text.toUpperCase() + '-');
        }
      } else {
        setPlaca(text.slice(0, text.length - 1).toUpperCase());
      }      
    } else if (text.length >= 4) {
      if (text[3] !== '-') {
        text = text.slice(0, 3) + '-' + text.slice(3);
      }
      if (text.length < 7){
        if (isNumericSlice(text, 4, text.length)){
          setPlaca(text);
        } else {
          // remove only the invalid last character instead of chopping all digits
          setPlaca(text.slice(0, text.length - 1));
        }
      } else if (text.length === 7){
        // include index 6 in the numeric check (slice end is exclusive => 4..6 -> use 7)
        if (isNumericSlice(text, 4, 6)){
          setPlaca(text.toUpperCase());
          
        } else if (isAlphabetic(text[6]) || isNumericSlice(text, 6, 7)){
          setPlaca(text.toUpperCase());
        } else {
          setPlaca(text.slice(0, text.length - 1));
        }
      } else if (text.length > 7) {
        setPlaca(text.slice(0, text.length - 1));
      }
    }
  }

  function selectVeicle(itemPlaca: string): void {
    setPlaca(itemPlaca);
  }

  const showAlert = () => {
    
    const vehicle = vehicles.find(v => v.placa === placa);
    if (vehicle) {
      const currentTime = new Date();
      const timeDiff = Math.abs(currentTime.getTime() - vehicle.time.getTime());
      const diffHours = Math.ceil(timeDiff / (1000 * 3600)); // convert to hours and round up
      let ratePerHour = vehicle.type === 'carro' ? 
        parseInt(parkingConfig.precioHoraCarros) : 
        parseInt(parkingConfig.precioHoraMotos);
      let totalBill = diffHours * ratePerHour;
  
    Alert.alert(
    `Factura para ${placa}.` ,
    `Tipo: ${vehicle.type}\nTiempo Estacionado: ${diffHours} horas\nTotal a Pagar: $${totalBill}`,
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Pagar",
          onPress: () => {
            setVehicles(prevVehicles => prevVehicles.filter(v => v.placa !== placa));
            setPlaca('');
            saveVehicleData(vehicles.filter(v => v.placa !== placa), totalBill);
            setTotal(prevTotal => prevTotal + totalBill);
            console.log(total)
          }
        }
      ],
      { cancelable: true }
    );
    };
  }

  const saveVehicleData = async (vehicles: object, total: number) => {
  try {
    await AsyncStorage.setItem('parqueaderosVehicles', JSON.stringify(vehicles));
    await AsyncStorage.setItem('parqueaderosTotal', JSON.stringify({ total, savedAt: new Date().toISOString() }));
    console.log('Data saved!');
  } catch (error) {
    console.error('Error saving data:', error);
  }
};


  // And update loadVehicleData to parse dates:
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
      const fetchData = async () => {
        const { vehicles, total } = await loadVehicleData();
        setVehicles(vehicles);
        setTotal(total);
        await loadParkingConfig();
      };

      fetchData();
    }, [])
  );

  /*
  

  */

  const printBarcode = async () => {
    if (!placa) {
      Alert.alert('Error', 'No hay placa para imprimir');
      return;
    }

    try {
      setIsPrinting(true);
      
      // Add a small delay to ensure the component is rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const uri = await barcodeRef.current?.capture!();
      if (!uri) {
        throw new Error('No se pudo generar el código de barras');
      }

      const currentTime = new Date().toLocaleString();
      const html = `
        <html>
          <body style="text-align:center; font-family: Arial, sans-serif; padding: 20px;">
            <div style="border: 1px solid #000; padding: 15px; max-width: 300px; margin: 0 auto;">
              <h2 style="margin: 0 0 10px 0;">Ticket de Parqueo</h2>
              <p style="font-size: 18px; margin: 5px 0;">Placa: ${placa}</p>
              <p style="font-size: 14px; margin: 5px 0;">Fecha: ${currentTime}</p>
              <div style="margin: 15px 0;">
                <img src="${uri}" style="width:200px;" />
              </div>
              <p style="font-size: 12px; margin-top: 15px;">
                Presente este ticket al retirar su vehículo
              </p>
            </div>
          </body>
        </html>
      `;

      await Print.printAsync({
        html,
        printerUrl: undefined // Let the user choose the printer
      });
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'No se pudo imprimir el ticket');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleConditionalSubmit = async () => {
    const state = await NetInfo.fetch();
    const isWifi = state.isConnected && state.type === 'wifi';

    if (isWifi) {
      await handleSubmit();  // with barcode printing
    } else {
      handleSubmit2();       // offline fallback
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={"light-content"}
        translucent={true} 
        backgroundColor="transparent"/>
      <View style={{backgroundColor: '#121212', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderBlockColor: '#363636ff', borderWidth: 3, marginBottom: 22}}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignContent: 'center', alignItems: 'center', width: '100%'}}>
          <Text style={{ color: '#fff', fontSize: 18, marginVertical: 10 }}>Carros: {currentVehicleCounts.carros}/{parkingConfig.maxCarros}</Text>
          <Text style={{ color: '#fff', fontSize: 18, marginVertical: 10, marginLeft: 20 }}>Motos: {currentVehicleCounts.motos}/{parkingConfig.maxMotos}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center', width: '100%' }}>
          <Pressable 
            style={{ maxHeight: '30%', height: '28%', borderColor: 'white', borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 }}
            android_ripple={{ color: '#555', borderless: true }}
            onPress={() => setPlaca('')}>
            <Text style={{ color: 'red', fontSize: 18 }}>❌</Text>
          </Pressable>
          <TextInput 
            style={styles.textsInput}    
            value={placa}   
            placeholder='  Ingrese la Placa'
            placeholderTextColor="#999"
            onChangeText={text => placaHandler(text)}
          />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', width: '60%', marginBottom: 30 }}>
          <Pressable 
            style={[styles.pressables, buttonOneBoolean ? {backgroundColor: '#00808bff'} : {backgroundColor: 'gray'}]}
            disabled={!buttonOneBoolean}
            android_ripple={{ color: '#fff', borderless: true }}
            onPress={() => {
              setButtonTwoBoolean(false);
              handleConditionalSubmit();
            }}>
            <Text style={{ color: '#fff', fontSize: 18 }}>Registrar</Text>
          </Pressable>
          <Pressable 
            style={[styles.pressables, buttonTwoBoolean ? {backgroundColor: '#00808bff'} : {backgroundColor: 'gray'}]}
            disabled={!buttonTwoBoolean}
            android_ripple={{ color: '#fff', borderless: true }}
            onPress={showAlert}>
            <Text style={{ color: '#fff', fontSize: 18 }}>Facturar</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1, borderBottomWidth: 20, borderBottomColor: '#555', marginBottom: 20 }}
        data={filteredVehicles}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => selectVeicle(item.placa)}>
            <View style={[ styles.list, index % 2 == 0 ? {backgroundColor: '#222'} : {backgroundColor: '#111'} ]}>
              <Text style={{ color: '#fff', fontSize: 18 }}>{item.placa} - {item.type} - {item.time.toLocaleString()}</Text>
            </View>
          </Pressable>
        )}
      />
      <ViewShot
        ref={barcodeRef}
        options={{ 
          format: 'png', 
          quality: 1,
          result: 'data-uri',
          width: 300,
          height: 100
        }}
        style={{
          position: 'absolute',
          opacity: 0,
          width: 300,
          height: 100,
        }}
        >
          <View style={{
            backgroundColor: 'white',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Barcode
              value={placa ? placa.replace(/-/g, '') : ' '}
              options={{ 
                format: 'CODE128',
                background: 'white',
                height: 80,
                width: 2
              }}
              rotation={0}
            />
          </View>
      </ViewShot>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight! + 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    padding: 10,
  },
  textsInput: {
    color: '#fff',
    backgroundColor: '#222',
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: '60%',
    marginLeft: 20,
    marginRight: 40,
    marginBottom: '10%',
    marginTop: '10%',
    alignContent: 'center',
    justifyContent: 'center', 
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
    borderRadius: 10,
  },
  pressables: {
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 5,
    borderBlockColor: '#fff',
  },
  list: {
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc',
    borderRadius: 5,
  }
});

