import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const ControlCita = () => {
  const router = useRouter();

  // Arreglo de opciones del menú con la nueva ruta de Citas Pendientes
  const menuItems = [
    { 
      title: 'Agendar Cita', 
      route: '/AgendarCita', 
      icon: 'calendar-plus', 
      color: '#007AFF',
      desc: 'Programar nueva consulta' 
    },
    { 
      title: 'Citas Pendientes', // Este botón manda a la pantalla de validación/cambio de estado
      route: '/CitasPendietes', 
      icon: 'clipboard-list-outline', 
      color: '#5856D6',
      desc: 'Validar y pasar a "En curso"' 
    },
    { 
      title: 'Citas en Curso', 
      route: '/CitasEnCurso', 
      icon: 'clock-fast', 
      color: '#4CAF50',
      desc: 'Pacientes en atención actual' 
    },
    { 
      title: 'Historial / Buscar', 
      route: '/Cita', 
      icon: 'clipboard-text-search', 
      color: '#FF9500',
      desc: 'Consultar citas pasadas' 
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.h1}>Control de Citas</Text>
          <Text style={styles.sub}>Gestión del flujo de pacientes</Text>
        </View>

        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.card, { borderLeftColor: item.color }]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View style={[styles.iconBadge, { backgroundColor: item.color + '15' }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={32} color={item.color} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc}>{item.desc}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sección de resumen rápido (Opcional/Visual) */}
        <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Resumen de hoy</Text>
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>--</Text>
                    <Text style={styles.statLabel}>Pendientes</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>--</Text>
                    <Text style={styles.statLabel}>Atendidos</Text>
                </View>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContainer: { padding: 20 },
  header: { marginBottom: 30, marginTop: 10 },
  h1: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E' },
  sub: { fontSize: 16, color: '#8E8E93', marginTop: 4 },
  grid: { gap: 16 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 18, 
    borderLeftWidth: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  iconBadge: { padding: 10, borderRadius: 12, marginRight: 15 },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  cardDesc: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  statsContainer: { marginTop: 40, padding: 20, backgroundColor: '#FFF', borderRadius: 20, elevation: 1 },
  statsTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 15 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#007AFF' },
  statLabel: { fontSize: 12, color: '#8E8E93', marginTop: 4 }
});

export default ControlCita;