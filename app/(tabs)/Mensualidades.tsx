import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import { Alert, FlatList, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { Checkbox } from "react-native-paper";

function isAlphabetic(str: string): boolean {
  return /^[A-Za-z]+$/.test(str);
}

function isNumericSlice(str: string, start: number, end: number): boolean {
  const slice = str.slice(start, end);
  return /^\d+$/.test(slice);
}

function addToDate(date: Date, amount: number, unit: 'months' | 'weeks'): Date {
  const baseDate = new Date(date.getTime()); // clone to avoid mutation

  if (unit === 'months') {
    const day = baseDate.getDate();
    const targetMonth = baseDate.getMonth() + amount;

    // Set to the 1st to avoid overflow, then adjust day
    baseDate.setDate(1);
    baseDate.setMonth(targetMonth);

    const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
    baseDate.setDate(Math.min(day, lastDay));
  } else {
    baseDate.setDate(baseDate.getDate() + amount * 7);
  }

  return baseDate;
}

function formatColombianDate(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}


type TimeUnit = 'months' | 'weeks' 

interface Vehicle {
  placa: string;
  type: 'carro' | 'moto';
  name: string,
  cedula: string,
  duration: number,
  formatedDate: string,
  time: Date,
  totalMoney: number
}

export default function Mensualidades() {
  const [placa, setPlaca] = React.useState<string>('');
  const [name, setName] = React.useState<string>('');
  const [duration, setDuration] = React.useState<number>(0);
  const [cedula, setCedula] = React.useState<string>('');
  const [tiempo, setTiempo] = React.useState<boolean>(true); // false => weeks, true => months
  const [total, setTotal] = React.useState<number>(0);

  const [filteredVehicles, setFilteredVehicles] = React.useState<Vehicle[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [buttonOneBoolean, setButtonOneBoolean] = React.useState<boolean>(false);
  const [buttonTwoBoolean, setButtonTwoBoolean] = React.useState<boolean>(false);
  const [buttonThreeBoolean, setButtonThreeBoolean] = React.useState<boolean>(false);
  const [isNewVehicle, setIsNewVehicle] = React.useState<boolean>(false);

  // Robust placa formatter: AAA-123 or AAA-123D (optional letter)
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

  // filter vehicles whenever placa or vehicles change
  React.useEffect(() => {
    const query = placa.trim().toLowerCase();
    const filtered = query.length === 0
      ? vehicles
      : vehicles.filter(v => v.placa.toLowerCase().includes(query));
    setFilteredVehicles(filtered);
  }, [placa, vehicles]);

  // update button states based on placa / vehicles
  React.useEffect(() => {
    const normalized = placa;
    if (normalized.length >= 6) {
      // Check if vehicles array exists and has items
      if (vehicles && vehicles.length > 0) {
        const exists = vehicles.some(v => v.placa === normalized);
        console.log('Vehicle exists:', exists, 'Name:', name, 'Duration:', duration);
        setButtonOneBoolean(!exists && name !== '' && duration !== 0); // Register if not exists
        setButtonTwoBoolean(exists);  // Bill if exists
        setButtonThreeBoolean(exists && duration !== 0);
      } else {
        // If vehicles is empty, this is definitely a new vehicle
        console.log('Vehicles array is empty, enabling register button if name and duration are set');
        setButtonOneBoolean(name !== '' && duration !== 0);
        setButtonTwoBoolean(false);
        setButtonThreeBoolean(false);
      }
      setIsNewVehicle(true);
    } else {
      setButtonOneBoolean(false);
      setButtonTwoBoolean(false);
      setButtonThreeBoolean(false);
      setIsNewVehicle(false);
    }
  }, [placa, vehicles, name, duration]); // Added name and duration to dependencies

  function selectVeicle(itemPlaca: string): void {
    setPlaca(itemPlaca);
  }

  function nameHandler(text: string): void {
    if (text.length == 1) text = text.toLocaleUpperCase()
    setName(text);
  }

  function timeHandler(text: string): void {
    if (text && buttonTwoBoolean) setButtonThreeBoolean(true)
    const digits = text.replace(/[^0-9]/g, '');
    setDuration(digits === '' ? 0 : parseInt(digits, 10));
  }

  function cedulaHandler(text: string): void {
    const digits = text.replace(/[^0-9]/g, '');
    setCedula(digits);
  }

  function handleSubmit(): void {
    // basic validation
    if (!placa || placa.length < 6) return;
    if (!duration || !name) return;

    const currentTime = new Date();
    const type: 'carro' | 'moto' = (placa[6] && isAlphabetic(placa[6])) || placa.length === 6 ? 'moto' : 'carro';
    const cedulaInside = cedula? cedula : 'No'
    const monthsOrWeeks: TimeUnit = tiempo ? 'months' : 'weeks'
    const finalTime = addToDate(currentTime, duration, monthsOrWeeks)
    const formatDate = formatColombianDate(finalTime)
    let totalMoney;

    //cambiar los valores
    if (type === 'carro'){
      if (monthsOrWeeks === 'months'){
        totalMoney = duration * 100000;
      } else totalMoney = duration * 30000;
    } else if (monthsOrWeeks == 'months'){
      totalMoney = duration * 40000;
    } else totalMoney = duration * 15000

    const logEntry: Vehicle = {
      placa,
      type,
      name,
      cedula: cedulaInside,
      duration,
      formatedDate: formatDate,
      time: finalTime,
      totalMoney
    };

    setVehicles(prev => [logEntry, ...prev]);
    // clear form fields after registering
    setPlaca('');
    setName('');
    setDuration(0);
    setCedula('');
    setIsNewVehicle(true);
    saveVehicleData([logEntry, ...vehicles]);
  }

  function renewMonth(): void {
    if (!placa || placa.length < 6) return;
    if (!duration || !name) return;

    const monthsOrWeeks: TimeUnit = tiempo ? 'months' : 'weeks';

    const applyRenew = (payed: boolean) => {
      setVehicles(prev => {
        const updatedList = prev.map(vehicle => {
          if (vehicle.placa === placa) {
            const extendedTime = addToDate(vehicle.time, duration, monthsOrWeeks);
            const updatedFormattedDate = formatColombianDate(extendedTime);

            let totalMoney: number;
            if (payed) {
              // replace with the new payment
              if (vehicle.type === 'carro') {
                totalMoney = monthsOrWeeks === 'months' ? duration * 100000 : duration * 30000;
              } else {
                totalMoney = monthsOrWeeks === 'months' ? duration * 40000 : duration * 15000;
              }
            } else {
              // accumulate unpaid balance
              if (vehicle.type === 'carro') {
                totalMoney = vehicle.totalMoney + (monthsOrWeeks === 'months' ? duration * 100000 : duration * 30000);
              } else {
                totalMoney = vehicle.totalMoney + (monthsOrWeeks === 'months' ? duration * 40000 : duration * 15000);
              }
            }

            return {
              ...vehicle,
              time: extendedTime,
              formatedDate: updatedFormattedDate,
              duration: vehicle.duration + duration,
              totalMoney
            };
          }
          return vehicle;
        });

        saveVehicleData(updatedList);
        return updatedList;
      });

      // clear form fields after renewing
      setPlaca('');
      setName('');
      setDuration(0);
      setCedula('');
      setIsNewVehicle(false);
    };

    Alert.alert(
      `¿El usuario ${name} ya pagó?`,
      `Si no ha pagado el nuevo saldo se acumulará con el anterior.`,
      [
        {
          text: "No",
          onPress: () => applyRenew(false),
          style: "cancel"
        },
        {
          text: "SI",
          onPress: () => applyRenew(true)
        }
      ],
      { cancelable: true }
    );
  }

  const saveVehicleData = async (vehicles: object) => {
  try {
    await AsyncStorage.setItem('mensualidadesVehicles', JSON.stringify(vehicles));
    await AsyncStorage.setItem('parqueaderosTotal', JSON.stringify({ total, savedAt: new Date().toISOString() }));
    console.log('Data saved!');
  } catch (error) {
    console.error('Error saving data:', error);
  }
};


  // And update loadVehicleData to parse dates:
  const loadVehicleData = async () => {
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

  useEffect(() => {
    const fetchData = async () => {
    const { vehicles, total } = await loadVehicleData();
    // Now do something with the data
    setVehicles(vehicles);
    setTotal(total);
    };

    fetchData();
  }, []);


  const showAlert = () => {
      
    const vehicle = vehicles.find(v => v.placa === placa);
    if (vehicle) {
  
      Alert.alert(
      `Eliminar Vehiculo ${placa}.` ,
      `Elimine el Vehiculo solo si ya han pagado!`,
        [
          {
            text: "Cancelar",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          {
            text: "OK",
            onPress: () => {
              setTotal(prevTotal => prevTotal + vehicle.totalMoney);
              const updatedVehicles = vehicles.filter(v => v.placa !== placa);
              setVehicles(updatedVehicles);
              saveVehicleData(updatedVehicles);
              setPlaca('');
              setName('');
              setDuration(0);
              setCedula('');
            }
          }
        ],
        { cancelable: true }
      );
    };
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"light-content"} translucent={true} backgroundColor="transparent" />
      <View style={styles.searchRow}>
        <Pressable
          style={styles.cancelBtn}
          android_ripple={{ color: '#555', borderless: true }}
          onPress={() => { 
            setPlaca('');
            setName(''); 
            setDuration(0);
            setCedula(''); 
          }}>
          <Text style={{ color: 'red', fontSize: 18 }}>❌</Text>
        </Pressable>

        <TextInput
          style={styles.textsInputPlaca}
          value={placa}
          placeholder='  Buscar o Registrar la Placa'
          placeholderTextColor="#ddd"
          onChangeText={placaHandler}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.formContainer}>
          <View style={styles.formRow}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.textsInput}
              value={name}
              placeholder='Ingrese el Nombre'
              placeholderTextColor="#ddd"
              onChangeText={nameHandler}
              editable={isNewVehicle}
              maxLength={20}
            />
          </View>

          <View style={styles.formRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Checkbox
                status={tiempo ? 'checked' : 'unchecked'}
                onPress={() => setTiempo(!tiempo)}
              />
              <Text style={styles.label}>{tiempo ? 'Meses' : 'Semanas'}</Text>
            </View>

            <TextInput
              style={styles.textsInput}
              value={duration ? duration?.toString() : ''}
              placeholder={tiempo ? 'Ingrese los Meses' : 'Ingrese las Semanas'}
              placeholderTextColor="#ddd"
              keyboardType='numeric'
              onChangeText={timeHandler}
              editable={isNewVehicle}
              maxLength={3}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Cédula</Text>
            <TextInput
              style={styles.textsInput}
              value={cedula}
              placeholder='Ingrese la Cédula'
              placeholderTextColor="#ddd"
              keyboardType='numeric'
              onChangeText={cedulaHandler}
              editable={isNewVehicle}
              maxLength={10}
            />
          </View>
        </View>

      <View style={styles.buttonsRow}>
        <Pressable
          style={[styles.pressables, buttonOneBoolean ? styles.activeBtn : styles.disabledBtn]}
          disabled={!buttonOneBoolean}
          android_ripple={{ color: '#fff', borderless: true }}
          onPress={handleSubmit}>
          <Text style={styles.btnText}>Registrar</Text>
        </Pressable>

        <Pressable
          style={[styles.pressables, buttonTwoBoolean ? styles.activeBtn : styles.disabledBtn]}
          disabled={!buttonTwoBoolean}
          android_ripple={{ color: '#fff', borderless: true }}
          onPress={showAlert}>
          <Text style={styles.btnText}>Eliminar</Text>
        </Pressable>
        
        <Pressable
          style={[styles.pressables, buttonThreeBoolean ? styles.activeBtn : styles.disabledBtn]}
          disabled={!buttonThreeBoolean}
          android_ripple={{ color: '#fff', borderless: true }}
          onPress={renewMonth}>
          <Text style={styles.btnText}>Renovar</Text>
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={{ paddingBottom: 20 }}
        data={filteredVehicles}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => {
            selectVeicle(item.placa);
            setCedula(item.cedula);
            setName(item.name);
          }
          }>
            <View style={[styles.list, index % 2 === 0 ? { backgroundColor: '#222' } : { backgroundColor: '#111' }]}>
              <Text style={{ color: '#fff', fontSize: 16 }}>{item.name} — {item.cedula}</Text>
              <Text style={{ color: '#fff', fontSize: 16 }}>{item.placa} — {item.type}</Text>
              <Text style={{ color: '#fff', fontSize: 16 }}>Vence: {item.formatedDate}</Text>
              <Text style={{ color: '#fff', fontSize: 16 }}>Total a Pagar: {item.totalMoney}</Text>
            </View>
          </Pressable>
        )}
        style={{ width: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight! + 8,
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 12,
  },
  searchRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelBtn: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    marginRight: 8,
  },
  textsInputPlaca: {
    flex: 1,
    color: '#fff',
    backgroundColor: '#222',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  textsInput: {
    flex: 1,
    backgroundColor: '#222',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
    maxWidth: '70%',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '60%',
    marginVertical: 12,
  },
  pressables: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 'auto',
    alignItems: 'center',
    marginHorizontal: 10
  },
  activeBtn: {
    backgroundColor: '#00808bff',
  },
  disabledBtn: {
    backgroundColor: 'gray',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
  },
  list: {
    width: '100%',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    borderRadius: 6,
    marginVertical: 4,
  },
  centeredFallback: {
    width: '100%',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
  },
});