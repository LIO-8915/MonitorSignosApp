// app/(tabs)/Graph.tsx
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
// Importamos getSignosByPaciente que es el método correcto en tu database.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSignosByPaciente, SignosVitales } from '../services/database';

const screenWidth = Dimensions.get('window').width;

export default function EvolucionSignosScreen() {
  const [loading, setLoading] = useState(true);
  const [mediciones, setMediciones] = useState<SignosVitales[]>([]);
  
  // Datos para gráficas
  const [spo2Data, setSpo2Data] = useState<any[]>([]);
  const [temperaturaData, setTemperaturaData] = useState<any[]>([]);
  const [bpmData, setBpmData] = useState<any[]>([]);
  
  // Estadísticas
  const [ultimaMedicion, setUltimaMedicion] = useState<SignosVitales | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // 1. Intentamos obtener el ID del paciente actual (si lo guardaste al seleccionarlo)
      // Si no hay uno seleccionado, podrías traer las del último registrado
      const pacienteId = await AsyncStorage.getItem('@id_paciente_actual');
      
      if (!pacienteId) {
        setLoading(false);
        return;
      }

      // 2. Traer datos de SQLite (Local) para velocidad
      const data = await getSignosByPaciente(pacienteId);
      setMediciones(data);

      if (data.length > 0) {
        // Ordenar y procesar para las gráficas de Gifted Charts
        const formattedSpo2 = data.map(m => ({ value: m.spo2, label: m.fecha.split('/')[0] }));
        const formattedTemp = data.map(m => ({ value: m.temperatura, label: m.fecha.split('/')[0] }));
        const formattedBpm = data.map(m => ({ value: m.bpm, label: m.fecha.split('/')[0] }));

        setSpo2Data(formattedSpo2);
        setTemperaturaData(formattedTemp);
        setBpmData(formattedBpm);
        setUltimaMedicion(data[data.length - 1]);
      }
    } catch (error) {
      console.error("Error al cargar gráficas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Cargando evolución...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Evolución de Signos</Text>

        {mediciones.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text>No hay mediciones registradas para este paciente.</Text>
          </View>
        ) : (
          <>
            {/* Resumen Superior */}
            <View style={styles.statsGrid}>
              <StatBox label="Último SpO2" value={`${ultimaMedicion?.spo2}%`} color="#2196F3" />
              <StatBox label="Último BPM" value={`${ultimaMedicion?.bpm}`} color="#F44336" />
              <StatBox label="Temperatura" value={`${ultimaMedicion?.temperatura}°C`} color="#4CAF50" />
            </View>

            {/* Gráfica de Oxigenación */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Saturación de Oxígeno (%)</Text>
              <LineChart
                data={spo2Data}
                color="#2196F3"
                thickness={3}
                noOfSections={4}
                areaChart
                startFillColor="rgba(33, 150, 243, 0.3)"
                endFillColor="rgba(33, 150, 243, 0.01)"
              />
            </View>

            {/* Gráfica de Ritmo Cardíaco */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Frecuencia Cardíaca (BPM)</Text>
              <BarChart
                data={bpmData}
                barWidth={22}
                capColor={'#F44336'}
                frontColor={'#F44336'}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const StatBox = ({ label, value, color }: any) => (
  <View style={[styles.statBox, { borderLeftColor: color, borderLeftWidth: 4 }]}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1A1A1A' },
  emptyCard: { padding: 40, alignItems: 'center', backgroundColor: '#fff', borderRadius: 12 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { backgroundColor: '#fff', padding: 12, borderRadius: 10, width: '31%', elevation: 2 },
  statLabel: { fontSize: 10, color: '#666', textTransform: 'uppercase' },
  statValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  chartCard: { backgroundColor: '#fff', padding: 16, borderRadius: 15, marginBottom: 20, elevation: 3 },
  chartTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#444' }
});