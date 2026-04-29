import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllPacientes, saveMedicionVital, SignosVitales } from '../services/database';
import { SyncService } from '../services/syncService';

export default function RegistroSignos() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<string>('');
  const [bpm, setBpm] = useState('');
  const [temp, setTemp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        setLoading(true);
        
        // 1. Intentar cargar pacientes de la sincronización de Firebase (SyncService)
        let lista = await SyncService.getPacientesParaMenu();
        
        // 2. Si no hay pacientes en el espejo de Firebase, intentar cargar de SQLite
        if (lista.length === 0) {
          console.log("No hay pacientes en SyncService, buscando en SQLite...");
          lista = await getAllPacientes();
        }

        setPacientes(lista);

        // 3. Recuperar el último seleccionado o seleccionar el primero por defecto
        const guardado = await AsyncStorage.getItem('@id_paciente_actual');
        if (guardado && lista.some((p: any) => (p.id || p.pacienteId) === guardado)) {
          setPacienteSeleccionado(guardado);
        } else if (lista.length > 0) {
          const primerId = lista[0].id || lista[0].pacienteId;
          setPacienteSeleccionado(primerId.toString());
        }
      } catch (error) {
        console.error("Error al inicializar lista de pacientes:", error);
      } finally {
        setLoading(false);
      }
    };

    inicializarDatos();
  }, []);

  const guardarSignos = async () => {
    if (!pacienteSeleccionado || !bpm || !temp || !spo2) {
      return Alert.alert("Error", "Por favor completa todos los campos y selecciona un paciente.");
    }

    try {
      // Creamos el objeto siguiendo la interfaz de database.ts
      const nuevaMedicion: SignosVitales = {
        pacienteId: pacienteSeleccionado,
        fecha: new Date().toISOString(),
        bpm: parseFloat(bpm),
        temperatura: parseFloat(temp),
        spo2: parseFloat(spo2)
      };

      const resultado = await saveMedicionVital(nuevaMedicion);
      
      if (resultado.success) {
        Alert.alert("Éxito", "Signos vitales guardados localmente.");
        // Limpiar campos después de guardar
        setBpm(''); setTemp(''); setSpo2('');
      } else {
        Alert.alert("Error", "No se pudo guardar en la base de datos.");
      }
    } catch (error) {
      Alert.alert("Error", "Hubo un fallo al procesar los datos.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Vincular Signos Vitales</Text>

        <View style={styles.selectorContainer}>
          <Text style={styles.label}>Seleccionar Paciente (Firebase/Local):</Text>
          <View style={styles.pickerWrapper}>
            {loading ? (
              <ActivityIndicator size="small" color="#3498db" />
            ) : (
              <Picker
                selectedValue={pacienteSeleccionado}
                onValueChange={(itemValue) => {
                  setPacienteSeleccionado(itemValue);
                  AsyncStorage.setItem('@id_paciente_actual', itemValue);
                }}
                mode="dropdown"
              >
                <Picker.Item label="-- Seleccione un paciente --" value="" color="#999" />
                {pacientes.map((p) => (
                  <Picker.Item 
                    key={p.id ? p.id.toString() : p.pacienteId.toString()} 
                    label={`${p.nombre} ${p.apellido || ''}`} 
                    value={p.id ? p.id.toString() : p.pacienteId.toString()} 
                  />
                ))}
              </Picker>
            )}
          </View>
        </View>

        <Text style={styles.label}>Frecuencia Cardíaca (BPM)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: 75" 
          keyboardType="numeric" 
          value={bpm} 
          onChangeText={setBpm} 
        />

        <Text style={styles.label}>Temperatura (°C)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: 36.5" 
          keyboardType="numeric" 
          value={temp} 
          onChangeText={setTemp} 
        />

        <Text style={styles.label}>Saturación de Oxígeno (SpO2 %)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: 98" 
          keyboardType="numeric" 
          value={spo2} 
          onChangeText={setSpo2} 
        />

        <TouchableOpacity style={styles.btn} onPress={guardarSignos}>
          <Text style={styles.btnText}>Guardar Registro</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F5F8' },
  scrollContent: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A2A3A', marginBottom: 20, textAlign: 'center' },
  selectorContainer: { backgroundColor: '#FFF', borderRadius: 12, padding: 10, marginBottom: 20, elevation: 3 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  pickerWrapper: { height: 50, justifyContent: 'center', backgroundColor: '#F8F9FA', borderRadius: 8 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16 },
  btn: { backgroundColor: '#3498db', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});