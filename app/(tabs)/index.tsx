import { StyleSheet, View, Text, StatusBar, TextInput, FlatList, Pressable, GestureResponderEvent, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';

function isAlphabetic(str: string): boolean {
  return /^[A-Za-z]+$/.test(str);
}

function isNumericSlice(str: string, start: number, end: number): boolean {
  const slice = str.slice(start, end);
  return /^\d+$/.test(slice);
}


interface Vehicle {
  placa: string;
  type: 'car' | 'bike';
  time: Date;
}

export default function HomeScreen() {

  const [placa, setPlaca] = React.useState<string>('');
  // Update state initializations with proper typing and empty arrays
  const [filteredVehicles, setFilteredVehicles] = React.useState<Vehicle[]>([]);
  const [buttonOneBoolean, setButtonOneBoolean] = React.useState<boolean>(false);
  const [buttonTwoBoolean, setButtonTwoBoolean] = React.useState<boolean>(false);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [total, setTotal] = React.useState<number>(0);




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

  function handleSubmit() {
    const currentTime = new Date(Date.now());
    let type: 'car' | 'bike';
    
    if (isAlphabetic(placa[6]) || placa.length === 6) {
      type = 'bike';
    } else {
      type = 'car';
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
      let ratePerHour = vehicle.type === 'car' ? 5000 : 2000; // example rates
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
          text: "OK",
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

  useEffect(() => {
    const fetchData = async () => {
    const { vehicles, total } = await loadVehicleData();
    // Now do something with the data
    setVehicles(vehicles);
    setTotal(total);
  };

  fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={"light-content"}
        translucent={true} 
        backgroundColor="transparent"/>
        <TextInput 
          style={styles.textsInput}    
          value={placa}   
          placeholder='  Ingrese la Placa'
          autoFocus={true}
          onChangeText={text => placaHandler(text)}
        />
      <View style={{ flexDirection: 'row', justifyContent: 'center', width: '60%', marginBottom: 30 }}>
        <Pressable 
          style={[styles.pressables, buttonOneBoolean ? {backgroundColor: '#00808bff'} : {backgroundColor: 'gray'}]}
          disabled={!buttonOneBoolean}
          android_ripple={{ color: '#fff', borderless: true }}
          onPress={handleSubmit}>
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
    backgroundColor: 'gray',
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: '60%',
    marginHorizontal: 40,
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

