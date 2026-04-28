import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getAllPacientes, Paciente, savePaciente } from '../services/database';
import { SyncService } from '../services/syncService';

export default function RegistroPacientes() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  const cargarLista = async () => {
    const data = await getAllPacientes();
    setPacientes(data);
  };

  const guardarPaciente = async () => {
    if (!nombre || !apellido) return Alert.alert("Error", "Campos incompletos");
    
    const nuevo: Paciente = {
      id: Date.now().toString(),
      pacienteId: "PAC-" + Math.floor(Math.random() * 1000),
      nombre, apellido, edad: '0', peso: '0', estatura: '0'
    };

    try {
      await savePaciente(nuevo); // Local SQLite
      await SyncService.addPaciente(nuevo); // Nube Firebase
      Alert.alert("Éxito", "Paciente registrado en la nube");
      setNombre(''); setApellido('');
      cargarLista();
    } catch (e) {
      Alert.alert("Error", "Error de conexión");
    }
  };

  const seleccionarPaciente = async (paciente: Paciente) => {
    try {
      // CORRECCIÓN: Convertir ID a String explícitamente para evitar error nativo
      await AsyncStorage.setItem('@id_paciente_actual', String(paciente.id));
      Alert.alert("Seleccionado", `Paciente: ${paciente.nombre}`);
    } catch (error) {
      console.error("Error en modulo nativo storage:", error);
    }
  };

  useEffect(() => { cargarLista(); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Pacientes</Text>
      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Apellido" value={apellido} onChangeText={setApellido} />
      <TouchableOpacity style={styles.btn} onPress={guardarPaciente}>
        <Text style={styles.btnText}>Guardar y Sincronizar</Text>
      </TouchableOpacity>
      <FlatList
        data={pacientes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => seleccionarPaciente(item)}>
            <Text style={styles.cardText}>{item.nombre} {item.apellido}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F9FA' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', padding: 12, marginBottom: 10, borderRadius: 8 },
  btn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, marginTop: 10, elevation: 2 },
  cardText: { fontSize: 16 }
});