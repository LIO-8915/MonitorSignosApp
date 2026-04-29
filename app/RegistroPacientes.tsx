import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getAllPacientes, Paciente, savePacienteLocal } from '../services/database';
import { SyncService } from '../services/syncService';

export default function RegistroPacientes() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [estatura, setEstatura] = useState('');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  const cargarLista = async () => {
    const data = await getAllPacientes();
    setPacientes(data);
  };

  const guardarPaciente = async () => {
    if (!nombre || !apellido) return Alert.alert("Error", "Nombre y apellido son obligatorios");
    if (!edad || isNaN(Number(edad))) return Alert.alert("Error", "Edad debe ser un número válido");
    if (!peso || isNaN(Number(peso))) return Alert.alert("Error", "Peso debe ser un número válido");
    if (!estatura || isNaN(Number(estatura))) return Alert.alert("Error", "Estatura debe ser un número válido (cm)");

    const nuevo: Paciente = {
      id: Date.now().toString(),
      pacienteId: "PAC-" + Math.floor(Math.random() * 1000),
      nombre,
      apellido,
      edad,
      peso,
      estatura,
    };

    try {
      await savePacienteLocal(nuevo); // Local SQLite
      await SyncService.addPaciente(nuevo); // Nube Firebase
      Alert.alert("Éxito", "Paciente registrado correctamente");
      // Limpiar campos
      setNombre('');
      setApellido('');
      setEdad('');
      setPeso('');
      setEstatura('');
      cargarLista();
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar el paciente. Revisa tu conexión.");
      console.error(e);
    }
  };

  const seleccionarPaciente = async (paciente: Paciente) => {
    try {
      await AsyncStorage.setItem('@id_paciente_actual', String(paciente.id));
      Alert.alert("Seleccionado", `Paciente: ${paciente.nombre} ${paciente.apellido}`);
    } catch (error) {
      console.error("Error en AsyncStorage:", error);
    }
  };

  useEffect(() => {
    cargarLista();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Pacientes</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre *"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido *"
        value={apellido}
        onChangeText={setApellido}
      />
      <TextInput
        style={styles.input}
        placeholder="Edad (años) *"
        value={edad}
        onChangeText={setEdad}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Peso (kg) *"
        value={peso}
        onChangeText={setPeso}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Estatura (cm) *"
        value={estatura}
        onChangeText={setEstatura}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.btn} onPress={guardarPaciente}>
        <Text style={styles.btnText}>Guardar y Sincronizar</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Pacientes registrados:</Text>
      <FlatList
        data={pacientes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => seleccionarPaciente(item)}>
            <Text style={styles.cardText}>
              {item.nombre} {item.apellido} – Edad: {item.edad} años
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F9FA' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#2C3E50' },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10, color: '#7F8C8D' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', padding: 12, marginBottom: 10, borderRadius: 8, fontSize: 16 },
  btn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, marginTop: 10, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  cardText: { fontSize: 16, color: '#2C3E50' }
});