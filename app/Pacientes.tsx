import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Paciente {
  id: string;
  nombre: string;
  edad: number;
  expediente: string;
  fechaRegistro: string;
}

export default function PacientesScreen() {
  // Aquí iría tu lógica para obtener pacientes de tu repo
  const [pacientes, setPacientes] = React.useState<Paciente[]>([]); 

  return (
    <View style={styles.container}>
      {/* Tu Tabla o Lista de Pacientes */}
      <FlatList 
        data={pacientes}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>No hay pacientes registrados.</Text>}
        renderItem={({ item }) => <Text>{item.nombre}</Text>}
      />

      {/* Botón que redirige a registro pacientes */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/(tabs)/RegistroPacientes')}
      >
        <Text style={styles.fabText}>+ Nuevo Paciente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 30,
    elevation: 5
  },
  fabText: { color: 'white', fontWeight: 'bold' }
});