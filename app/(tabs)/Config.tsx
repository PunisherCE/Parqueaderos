import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';

interface ParkingConfig {
  maxMotos: string;
  maxCarros: string;
  precioHoraMotos: string;
  precioHoraCarros: string;
  precioMesMotos: string;
  precioMesCarros: string;
}

const defaultConfig: ParkingConfig = {
  maxMotos: '50',
  maxCarros: '30',
  precioHoraMotos: '2000',
  precioHoraCarros: '5000',
  precioMesMotos: '40000',
  precioMesCarros: '100000',
};

const ADMIN_PASSWORD = '1234'; // You should change this to your desired password

export default function Config() {
  const [isEditable, setIsEditable] = useState(false);
  const [password, setPassword] = useState('');
  const [config, setConfig] = useState<ParkingConfig>(defaultConfig);

  // Load saved configuration on component mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem('parkingConfig');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const saveConfig = async () => {
    try {
      await AsyncStorage.setItem('parkingConfig', JSON.stringify(config));
      Alert.alert('Éxito', 'Configuración guardada correctamente');
    } catch (error) {
      console.error('Error saving config:', error);
      Alert.alert('Error', 'No se pudo guardar la configuración');
    }
  };

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setIsEditable(true);
      setPassword('');
    } else {
      Alert.alert('Error', 'Contraseña incorrecta');
      setPassword('');
    }
  };

  const handleSave = () => {
    // Validate all fields are numbers
    const configValues = Object.values(config);
    const allValid = configValues.every(value => !isNaN(Number(value)) && value !== '');

    if (!allValid) {
      Alert.alert('Error', 'Todos los campos deben ser números válidos');
      return;
    }

    saveConfig();
    setIsEditable(false);
  };

  const updateConfig = (key: keyof ParkingConfig, value: string) => {
    // Only allow numbers
    const numberValue = value.replace(/[^0-9]/g, '');
    setConfig(prev => ({
      ...prev,
      [key]: numberValue
    }));
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content"
        translucent={true} 
        backgroundColor="transparent"
      />
      
      {!isEditable ? (
        <View style={styles.passwordContainer}>
          <Text style={styles.passwordTitle}>Control de Acceso</Text>
          <Text style={styles.passwordLabel}>Ingrese la contraseña para editar la configuración:</Text>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            keyboardType="numeric"
          />
          <Pressable
            style={styles.passwordButton}
            onPress={handlePasswordSubmit}
          >
            <Text style={styles.passwordButtonText}>Desbloquear Configuración</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Capacidad Máxima</Text>
            <View style={styles.inputRow}>
              <Text style={styles.label}>Motos:</Text>
              <TextInput
                style={styles.input}
                value={config.maxMotos}
                onChangeText={(value) => updateConfig('maxMotos', value)}
                keyboardType="numeric"
                placeholder="Máx. Motos"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.label}>Carros:</Text>
              <TextInput
                style={styles.input}
                value={config.maxCarros}
                onChangeText={(value) => updateConfig('maxCarros', value)}
                keyboardType="numeric"
                placeholder="Máx. Carros"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Precios por Hora</Text>
            <View style={styles.inputRow}>
              <Text style={styles.label}>Motos:</Text>
              <TextInput
                style={styles.input}
                value={config.precioHoraMotos}
                onChangeText={(value) => updateConfig('precioHoraMotos', value)}
                keyboardType="numeric"
                placeholder="Precio hora motos"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.label}>Carros:</Text>
              <TextInput
                style={styles.input}
                value={config.precioHoraCarros}
                onChangeText={(value) => updateConfig('precioHoraCarros', value)}
                keyboardType="numeric"
                placeholder="Precio hora carros"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Precios Mensuales</Text>
            <View style={styles.inputRow}>
              <Text style={styles.label}>Motos:</Text>
              <TextInput
                style={styles.input}
                value={config.precioMesMotos}
                onChangeText={(value) => updateConfig('precioMesMotos', value)}
                keyboardType="numeric"
                placeholder="Precio mes motos"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.label}>Carros:</Text>
              <TextInput
                style={styles.input}
                value={config.precioMesCarros}
                onChangeText={(value) => updateConfig('precioMesCarros', value)}
                keyboardType="numeric"
                placeholder="Precio mes carros"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <Pressable
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Guardar Cambios</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight! + 20,
    backgroundColor: '#000',
    padding: 16,
  },
  passwordContainer: {
    backgroundColor: '#121212',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  passwordTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  passwordLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  passwordInput: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    fontSize: 20,
    width: '100%',
    marginBottom: 24,
    textAlign: 'center',
  },
  passwordButton: {
    backgroundColor: '#00808bff',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  passwordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#121212',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    width: 80,
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    color: '#fff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#00808bff',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: '#00808bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});