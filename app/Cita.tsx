import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { equalTo, onValue, orderByChild, query, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../services/firebase';
import { SyncService } from '../services/syncService'; // ✅ Importar SyncService

export default function CitaHistorial() {
  const [loading, setLoading] = useState(false);
  const [citas, setCitas] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]); // Tipo genérico para pacientes de SyncService
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<string>('');

  // 1. Cargar pacientes desde SyncService (Firebase + AsyncStorage)
  useEffect(() => {
    const inicializar = async () => {
      const lista = await SyncService.getPacientes(); // ✅ Fuente unificada
      setPacientes(lista);
      
      const idGuardado = await AsyncStorage.getItem('@id_paciente_actual');
      if (idGuardado && lista.some(p => p.id === idGuardado)) {
        setPacienteSeleccionado(idGuardado);
      } else if (lista.length > 0) {
        setPacienteSeleccionado(lista[0].id);
      }
    };
    inicializar();
  }, []);

  // 2. Escuchar citas en Firebase según paciente seleccionado
  useEffect(() => {
    if (!pacienteSeleccionado) {
      setCitas([]);
      return;
    }

    setLoading(true);
    const citasQuery = query(
      ref(db, 'citas'),
      orderByChild('pacienteId'),
      equalTo(pacienteSeleccionado)
    );

    const unsubscribe = onValue(citasQuery, (snapshot) => {
      const lista: any[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(key => {
          lista.push({ id: key, ...data[key] });
        });
        lista.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      }
      setCitas(lista);
      setLoading(false);
    });

    AsyncStorage.setItem('@id_paciente_actual', pacienteSeleccionado);
    return () => unsubscribe();
  }, [pacienteSeleccionado]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Citas</Text>
        <Text style={styles.subtitle}>Selecciona un paciente para ver sus registros</Text>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={pacienteSeleccionado}
          onValueChange={(itemValue) => setPacienteSeleccionado(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="-- Seleccione un paciente --" value="" />
          {pacientes.map((p) => (
            <Picker.Item key={p.id} label={`${p.nombre} ${p.apellido || ''}`} value={p.id} />
          ))}
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={citas}
          contentContainerStyle={{ padding: 20 }}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.citaCard}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateText}>{item.fecha}</Text>
                <Text style={styles.timeText}>{item.hora}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.motivo}>{item.motivo || 'Consulta general'}</Text>
                <Text style={[styles.status, { color: item.status === 'concluida' ? '#34C759' : '#FF9500' }]}>
                  ● {item.status ? item.status.toUpperCase() : 'PENDIENTE'}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            pacienteSeleccionado ? (
              <Text style={styles.empty}>No se encontraron citas para este paciente.</Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

// Los estilos se mantienen igual

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E5E5EA' },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  pickerContainer: {
    backgroundColor: '#FFF',
    margin: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    overflow: 'hidden'
  },
  picker: { height: 55, width: '100%' },
  citaCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 15, 
    flexDirection: 'row', 
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  dateBadge: { 
    width: 90, 
    alignItems: 'center', 
    borderRightWidth: 1, 
    borderColor: '#F2F2F7', 
    paddingRight: 10 
  },
  dateText: { fontSize: 14, fontWeight: 'bold', color: '#1C1C1E' },
  timeText: { fontSize: 12, color: '#8E8E93' },
  info: { flex: 1, paddingLeft: 15 },
  motivo: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  status: { fontSize: 12, fontWeight: 'bold', marginTop: 5 },
  empty: { textAlign: 'center', marginTop: 40, color: '#8E8E93', fontSize: 16 }
});