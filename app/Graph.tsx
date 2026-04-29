import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllPacientes, getSignosByPaciente, Paciente } from '../services/database';
import { SyncService } from '../services/syncService';

export default function EvolucionDetalle() {
  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [idSeleccionado, setIdSeleccionado] = useState<string>('');
  
  const [pruebas, setPruebas] = useState<any[]>([]);
  const [dataGraficaTemp, setDataGraficaTemp] = useState<any[]>([]);
  const [dataGraficaBpm, setDataGraficaBpm] = useState<any[]>([]);

  useEffect(() => {
    const inicializar = async () => {
      try {
        setLoading(true);
        // ✅ Usamos SyncService para obtener TODOS los pacientes (Firebase + AsyncStorage)
        const lista = await SyncService.getPacientes();
        if (lista && lista.length > 0) {
          setPacientes(lista);
          setIdSeleccionado(lista[0].id.toString());
        } else {
          console.log("⚠️ No hay pacientes en SyncService, intentando SQLite...");
          const listaSQLite = await getAllPacientes();
          setPacientes(listaSQLite);
          if (listaSQLite.length > 0) setIdSeleccionado(listaSQLite[0].id.toString());
        }
      } catch (error) {
        console.error("❌ Error cargando pacientes:", error);
      } finally {
        setLoading(false);
      }
    };
    inicializar();
  }, []);

  useEffect(() => {
    if (idSeleccionado) cargarHistorial(idSeleccionado);
  }, [idSeleccionado]);

  const cargarHistorial = async (id: string) => {
    setLoading(true);
    const resPruebas = await SyncService.obtenerResultadosPorPaciente(id);
    setPruebas(resPruebas.reverse());

    const resSignos = await getSignosByPaciente(id);
    
    // Formatear para temperatura
    const tempFormateados = resSignos.map((s: any) => ({
      value: parseFloat(s.temperatura),
      label: new Date(s.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
    }));
    setDataGraficaTemp(tempFormateados);

    // Formatear para pulsaciones (bpm)
    const bpmFormateados = resSignos.map((s: any) => ({
      value: parseFloat(s.bpm),
      label: new Date(s.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
    }));
    setDataGraficaBpm(bpmFormateados);

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.selectorCard}>
        <Text style={styles.label}>Paciente a consultar:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={idSeleccionado}
            onValueChange={(val) => setIdSeleccionado(val)}
          >
            {pacientes.map((p: Paciente) => (
              <Picker.Item key={p.id} label={p.nombre} value={p.id.toString()} />
            ))}
          </Picker>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Gráfica de Temperatura */}
        <Text style={styles.sectionTitle}>Evolución de Temperatura (°C)</Text>
        <View style={styles.chartContainer}>
          {dataGraficaTemp.length > 0 ? (
            <LineChart
              data={dataGraficaTemp}
              thickness={3}
              color="#3498db"
              dataPointsColor="#2980b9"
              dataPointsRadius={4}
              textColor1="#2C3E50"
              textShiftY={-8}
              hideDataPoints={false}
              startFillColor="rgba(52,152,219,0.3)"
              endFillColor="rgba(52,152,219,0.01)"
              curved
              isAnimated
              yAxisTextStyle={{ fontSize: 10 }}
              xAxisLabelTextStyle={{ fontSize: 10, marginTop: 5 }}
            />
          ) : (
            <Text style={styles.noData}>Sin registros de temperatura</Text>
          )}
        </View>

        {/* Gráfica de Pulsaciones */}
        <Text style={styles.sectionTitle}>Evolución de Pulsaciones (bpm)</Text>
        <View style={styles.chartContainer}>
          {dataGraficaBpm.length > 0 ? (
            <LineChart
              data={dataGraficaBpm}
              thickness={3}
              color="#e67e22"
              dataPointsColor="#d35400"
              dataPointsRadius={4}
              textColor1="#2C3E50"
              textShiftY={-8}
              hideDataPoints={false}
              startFillColor="rgba(230,126,34,0.3)"
              endFillColor="rgba(230,126,34,0.01)"
              curved
              isAnimated
              yAxisTextStyle={{ fontSize: 10 }}
              xAxisLabelTextStyle={{ fontSize: 10, marginTop: 5 }}
            />
          ) : (
            <Text style={styles.noData}>Sin registros de pulsaciones</Text>
          )}
        </View>

        {/* Pruebas Geriátricas */}
        <Text style={styles.sectionTitle}>Pruebas Geriátricas Realizadas</Text>
        {pruebas.length > 0 ? (
          pruebas.map((p, i) => (
            <View key={i} style={styles.pruebaItem}>
              <View style={styles.pruebaHeader}>
                <Text style={styles.pruebaNombre}>{p.tipoPrueba}</Text>
                <Text style={styles.pruebaFecha}>{new Date(p.fecha).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.pruebaScore}>Puntaje: {p.resultado}</Text>
              {p.nota !== "" && <Text style={styles.pruebaNota}>{p.nota}</Text>}
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No hay pruebas geriátricas para este paciente.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F5F8' },
  selectorCard: { backgroundColor: '#FFF', padding: 15, margin: 20, borderRadius: 12, elevation: 3 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#7F8C8D', marginBottom: 5 },
  pickerWrapper: { backgroundColor: '#F8F9FA', borderRadius: 8, borderWidth: 1, borderColor: '#EBEDF0' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A2A3A', marginBottom: 15, marginTop: 20 },
  chartContainer: { backgroundColor: '#FFF', padding: 15, borderRadius: 16, alignItems: 'center', marginBottom: 10 },
  pruebaItem: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 10, borderLeftWidth: 5, borderLeftColor: '#3498db' },
  pruebaHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  pruebaNombre: { fontWeight: 'bold', color: '#2C3E50' },
  pruebaFecha: { fontSize: 12, color: '#95A5A6' },
  pruebaScore: { fontSize: 22, fontWeight: '800', color: '#2ECC71', marginVertical: 5 },
  pruebaNota: { fontSize: 13, color: '#7F8C8D', fontStyle: 'italic' },
  noData: { textAlign: 'center', color: '#BDC3C7', padding: 20 }
});