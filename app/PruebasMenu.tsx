import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Mapeo exhaustivo basado en tu estructura de archivos
const PRUEBAS = [
  { id: '20', nombre: 'Entorno', archivo: 'Prueba 20 entorno', color: '#607D8B' },
  { id: '19', nombre: 'Maltrato', archivo: 'Prueba 19 Maltrato', color: '#E91E63' },
  { id: '18', nombre: 'OARSS', archivo: 'Prueba 18 OARSSScreen', color: '#9C27B0' },
  { id: '15', nombre: 'MNA-SF', archivo: 'Prueba 15 MNA-SF', color: '#4CAF50' },
  { id: '13', nombre: 'Auditiva', archivo: 'Prueba 13 Auditiva', color: '#00BCD4' },
  { id: '12', nombre: 'Norton', archivo: 'Prueba 12 Norton', color: '#FF9800' },
  { id: '11', nombre: 'Braden', archivo: 'Prueba 11 Braden', color: '#FF5722' },
  { id: '8', nombre: 'Lawton', archivo: 'Prueba 8 Lawton', color: '#795548' },
  { id: '7', nombre: 'KatzIndex', archivo: 'Prueba 7 KatzIndex', color: '#3F51B5' },
  { id: '6', nombre: 'CESD7Test', archivo: 'Prueba 6 CESD7Test', color: '#2196F3' },
  { id: '5', nombre: 'Formulario', archivo: 'Prueba 5 formulario', color: '#009688' },
  { id: '4', nombre: 'MoCA', archivo: 'Prueba 4 moca', color: '#673AB7' },
  { id: '3', nombre: 'Minimental', archivo: 'Prueba 3 minimental 1', color: '#f44336' },
];

export default function PruebasMenuScreen() {
  const navegarAPrueba = (archivo: string) => {
      // Al usar nombres con espacios, es vital que coincidan exactamente
      // Expo Router mapea "Prueba 20 entorno.tsx" a "/Prueba 20 entorno"
      router.push(`/${archivo}` as any);
  };
  
  const renderItem = ({ item }: { item: typeof PRUEBAS[0] }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navegarAPrueba(item.archivo)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Text style={styles.iconText}>{item.id}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.pruebaTitulo}>Prueba {item.id}</Text>
        <Text style={styles.pruebaNombre}>{item.nombre}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={PRUEBAS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.headerTitle}>Evaluaciones Geriátricas</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', padding: 20, color: '#333' },
  listContent: { paddingHorizontal: 15, paddingBottom: 30 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: { flex: 1, marginLeft: 15 },
  pruebaNumero: { fontSize: 11, fontWeight: 'bold', color: '#888', textTransform: 'uppercase' },
  pruebaNombre: { fontSize: 15, color: '#333', fontWeight: '600' },
  iconText: { color: '#fff', fontWeight: 'bold' },
  pruebaTitulo: { fontSize: 11, color: '#999', fontWeight: 'bold' },
});