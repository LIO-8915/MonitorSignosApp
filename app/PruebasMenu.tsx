import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PRUEBAS = [
  { id: '20', nombre: 'Valoración de Entorno', archivo: 'Prueba 20 entorno', icono: 'home', color: '#607D8B' },
  { id: '19', nombre: 'Detección de Maltrato', archivo: 'Prueba 19 Maltrato', icono: 'warning', color: '#E91E63' },
  { id: '18', nombre: 'Recursos Sociales (OARSS)', archivo: 'Prueba 18 OARSSScreen', icono: 'people', color: '#9C27B0' },
  { id: '15', nombre: 'Nutrición (MNA-SF)', archivo: 'Prueba 15 MNA-SF', icono: 'restaurant', color: '#4CAF50' },
  { id: '13', nombre: 'Capacidad Auditiva', archivo: 'Prueba 13 Auditiva', icono: 'ear', color: '#00BCD4' },
  { id: '12', nombre: 'Riesgo de Escaras (Norton)', archivo: 'Prueba 12 Norton', icono: 'body', color: '#FF9800' },
  { id: '11', nombre: 'Riesgo de Escaras (Braden)', archivo: 'Prueba 11 Braden', icono: 'shield', color: '#FF5722' },
  { id: '8', nombre: 'Actividades (Lawton)', archivo: 'Prueba 8 Lawton', icono: 'construct', color: '#795548' },
  { id: '7', nombre: 'Actividades Básicas (Katz)', archivo: 'Prueba 7 KatzIndex', icono: 'walk', color: '#3F51B5' },
  { id: '6', nombre: 'Depresión (CESD-7)', archivo: 'Prueba 6 CESD7Test', icono: 'sad', color: '#2196F3' },
  { id: '5', nombre: 'Formulario General', archivo: 'Prueba 5 formulario', icono: 'document-text', color: '#009688' },
  { id: '4', nombre: 'Cognición (MoCA)', archivo: 'Prueba 4 moca', icono: 'bulb', color: '#673AB7' },
  { id: '3', nombre: 'Minimental (MMSE)', archivo: 'Prueba 3 minimental 1', icono: 'fitness', color: '#f44336' },
];

export default function PruebasMenuScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Evaluaciones Clínicas</Text>
      </View>

      {PRUEBAS.map((item) => (
        /* Usar Link con href directo suele ser más compatible con nombres con espacios */
        <Link key={item.id} href={`/${item.archivo}` as any} asChild>
          <TouchableOpacity style={styles.card} activeOpacity={0.7}>
            <View style={[styles.iconBox, { backgroundColor: item.color }]}>
              <Text style={{color: '#fff', fontWeight: 'bold'}}>{item.id}</Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.nameLabel}>{item.nombre}</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 25 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#1F2937' },
  headerSub: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 },
  idLabel: { fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1 },
  nameLabel: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 2 },
  footer: { marginTop: 20, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#9CA3AF' }
});