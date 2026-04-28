import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllPacientes, Paciente, registrarEnBitacora, saveMedicionVital } from '../services/database';

export default function RegistroSignos() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState('');
  
  const [bpm, setBpm] = useState('');
  const [temp, setTemp] = useState('');
  const [spo2, setSpo2] = useState('');

  // 1. Cargar la lista de pacientes desde SQLite al abrir la pantalla
  useEffect(() => {
    const cargarPacientes = async () => {
      const data = await getAllPacientes();
      setPacientes(data);
      
      // Intentar recuperar el último paciente seleccionado si existe
      const guardado = await AsyncStorage.getItem('@id_paciente_actual');
      if (guardado) setPacienteSeleccionado(guardado);
    };
    cargarPacientes();
  }, []);

  const guardarSignos = async () => {
    // Validación de selección
    if (!pacienteSeleccionado) {
      return Alert.alert("Error", "Debes seleccionar un paciente primero");
    }

    if (!bpm || !temp || !spo2) {
      return Alert.alert("Error", "Por favor completa todos los signos vitales");
    }

    const nuevaMedicion = {
      pacienteId: pacienteSeleccionado,
      fecha: new Date().toLocaleDateString(),
      bpm: parseInt(bpm),
      temperatura: parseFloat(temp),
      spo2: parseInt(spo2)
    };

    try {
      // 1. Guardar localmente para futuras pantallas (gráficas)
      await saveMedicionVital(nuevaMedicion);
      
      // 2. Vincular y persistir el ID del paciente para la "pantalla que aún no haces"
      await AsyncStorage.setItem('@id_paciente_actual', pacienteSeleccionado);

      // 3. Bitácora
      const usuario = await AsyncStorage.getItem('@ultimo_usuario') || 'Médico';
      await registrarEnBitacora({
        fecha: nuevaMedicion.fecha,
        hora: new Date().toLocaleTimeString(),
        usuario,
        movimiento: 'PRUEBA_MEDICA'
      });

      Alert.alert("Éxito", `Signos vinculados a ${pacienteSeleccionado}`);
      setBpm(''); setTemp(''); setSpo2('');
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la medición");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Registro de Signos Vitales</Text>

        {/* Picker para seleccionar y vincular paciente */}
        <Text style={styles.label}>Seleccionar Paciente</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={pacienteSeleccionado}
            onValueChange={(itemValue) => setPacienteSeleccionado(itemValue)}
          >
            <Picker.Item label="-- Seleccione un paciente --" value="" />
            {pacientes.map((p) => (
              <Picker.Item key={p.id} label={`${p.nombre} ${p.apellido}`} value={p.id} />
            ))}
          </Picker>
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
          <Text style={styles.btnText}>Vincular y Guardar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1C1C1E', textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 5 },
  input: { 
    backgroundColor: '#FFF', 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 10, 
    padding: 15, 
    marginBottom: 20, 
    fontSize: 16 
  },
  pickerWrapper: { 
    backgroundColor: '#FFF', 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 10, 
    marginBottom: 25, 
    overflow: 'hidden' 
  },
  btn: { 
    backgroundColor: '#007AFF', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 10
  },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});