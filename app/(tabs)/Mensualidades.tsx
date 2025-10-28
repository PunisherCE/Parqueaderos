import React from 'react';
import { StyleSheet, View, Text, StatusBar, Pressable, TextInput, FlatList } from 'react-native';
import { Checkbox } from "react-native-paper";

function isAlphabetic(str: string): boolean {
  return /^[A-Za-z]+$/.test(str);
}

interface Vehicle {
  placa: string;
  type: 'car' | 'bike';
  time: Date;
}

export default function Mensualidades() {
  const [placa, setPlaca] = React.useState<string>('');
  const [name, setName] = React.useState<string>('');
  const [duration, setDuration] = React.useState<string>(''); // keep as string for TextInput
  const [tiempo, setTiempo] = React.useState<boolean>(false); // false => weeks, true => months
  const [cedula, setCedula] = React.useState<string>('');

  const [filteredVehicles, setFilteredVehicles] = React.useState<Vehicle[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [buttonOneBoolean, setButtonOneBoolean] = React.useState<boolean>(false);
  const [buttonTwoBoolean, setButtonTwoBoolean] = React.useState<boolean>(false);
  const [isNewVehicle, setIsNewVehicle] = React.useState<boolean>(true);

  // Robust placa formatter: AAA-123 or AAA-123D (optional letter)
  function placaHandler(text: string) {
    const prev = placa;
    const typingForward = text.length > prev.length;

    // keep only letters & digits
    const rawChars = text.toUpperCase().replace(/[^A-Z0-9]/g, '').split('');

    // collect up to 3 letters
    let i = 0;
    let letters = '';
    while (letters.length < 3 && i < rawChars.length) {
      if (/[A-Z]/.test(rawChars[i])) letters += rawChars[i];
      i++;
    }

    // collect up to 3 digits
    let digits = '';
    while (digits.length < 3 && i < rawChars.length) {
      if (/\d/.test(rawChars[i])) digits += rawChars[i];
      i++;
    }

    // optional single letter at end
    let lastLetter = '';
    while (!lastLetter && i < rawChars.length) {
      if (/[A-Z]/.test(rawChars[i])) lastLetter = rawChars[i];
      i++;
    }

    let formatted = letters;
    if ((letters.length === 3 || digits.length > 0) && typingForward) {
      formatted += '-';
    } else if (prev[3] === '-' && !typingForward && prev.startsWith(letters)) {
      // preserve hyphen if it was present and user didn't remove the first part
      formatted = prev.slice(0, Math.min(prev.length, 4));
    }

    if (digits.length > 0) formatted += digits;
    if (lastLetter) formatted += lastLetter;

    setPlaca(formatted);
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
      const exists = vehicles.some(v => v.placa === normalized);
      setButtonOneBoolean(!exists); // Register if not exists
      setButtonTwoBoolean(exists);  // Bill if exists
    } else {
      setButtonOneBoolean(false);
      setButtonTwoBoolean(false);
    }
  }, [placa, vehicles]);

  function selectVeicle(itemPlaca: string): void {
    setPlaca(itemPlaca);
  }

  function nameHandler(text: string): void {
    setName(text);
  }

  function timeHandler(text: string): void {
    // allow only digits
    const digits = text.replace(/[^0-9]/g, '');
    setDuration(digits);
  }

  function cedulaHandler(text: string): void {
    const digits = text.replace(/[^0-9]/g, '');
    setCedula(digits);
  }

  function handleSubmit(): void {
    // basic validation
    if (!placa || placa.length < 6) return;
    const currentTime = new Date();
    const type: 'car' | 'bike' = (placa[6] && isAlphabetic(placa[6])) || placa.length === 6 ? 'bike' : 'car';

    const logEntry: Vehicle = {
      placa,
      type,
      time: currentTime
    };

    setVehicles(prev => [logEntry, ...prev]);
    // clear form fields after registering
    setPlaca('');
    setName('');
    setDuration('');
    setCedula('');
    setIsNewVehicle(true);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"light-content"} translucent={true} backgroundColor="transparent" />
      <View style={styles.searchRow}>
        <Pressable
          style={styles.cancelBtn}
          android_ripple={{ color: '#555', borderless: true }}
          onPress={() => { setPlaca(''); }}>
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

      {isNewVehicle ? (
        <View style={styles.formContainer}>
          <View style={styles.formRow}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.textsInput}
              value={name}
              placeholder='Ingrese el Nombre'
              placeholderTextColor="#ddd"
              onChangeText={nameHandler}
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
              value={duration}
              placeholder={tiempo ? 'Ingrese los Meses' : 'Ingrese las Semanas'}
              placeholderTextColor="#ddd"
              keyboardType='numeric'
              onChangeText={timeHandler}
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
            />
          </View>
        </View>
      ) : (
        <View style={styles.centeredFallback}>
          <Text style={{ color: 'red', fontSize: 18 }}>❌</Text>
        </View>
      )}

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
          onPress={() => { /* facturar action */ }}>
          <Text style={styles.btnText}>Facturar</Text>
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={{ paddingBottom: 20 }}
        data={filteredVehicles}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => selectVeicle(item.placa)}>
            <View style={[styles.list, index % 2 === 0 ? { backgroundColor: '#222' } : { backgroundColor: '#111' }]}>
              <Text style={{ color: '#fff', fontSize: 16 }}>{item.placa} — {item.type} — {item.time.toLocaleString()}</Text>
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
    justifyContent: 'space-around',
    width: '60%',
    marginVertical: 12,
  },
  pressables: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 110,
    alignItems: 'center',
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