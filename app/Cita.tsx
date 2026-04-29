import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { equalTo, get, onValue, orderByChild, query, ref, update } from 'firebase/database';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registrarBitacora } from '../services/bitacoraService';
import { db } from '../services/firebase';
import { SyncService } from '../services/syncService';


// Interfaz para pacientes (la que devuelve SyncService)
interface PacienteSimple {
  id: string;
  nombre: string;
  apellido?: string;
}

export default function CitaHistorial() {
  const [loading, setLoading] = useState(false);
  const [citas, setCitas] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<PacienteSimple[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<string>('');

  // 1. Cargar pacientes desde SyncService (Firebase + AsyncStorage)
  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    const cargarPacientes = async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        const lista = await SyncService.getPacientes();
        if (!isMounted) return;

        setPacientes(lista);

        // Restaurar última selección si existe y es válida
        const idGuardado = await AsyncStorage.getItem('@id_paciente_actual');
        if (idGuardado && lista.some((p: any) => p.id === idGuardado)) {
          setPacienteSeleccionado(idGuardado);
        } else if (lista.length > 0) {
          setPacienteSeleccionado(lista[0].id);
        } else {
          setPacienteSeleccionado('');
        }
      } catch (error) {
        console.error('Error cargando pacientes:', error);
        if (isMounted) setPacientes([]);
      } finally {
        isFetching = false;
      }
    };

    cargarPacientes();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Escuchar citas en Firebase con AbortController y cleanup completo
  useEffect(() => {
    const abortController = new AbortController();

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

    const unsubscribe = onValue(
      citasQuery,
      (snapshot) => {
        // Si la operación fue abortada, no hacer nada
        if (abortController.signal.aborted) return;

        const lista: any[] = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach(key => {
            lista.push({ id: key, ...data[key] });
          });
          // Ordenar por fecha de creación (más reciente primero)
          lista.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        }
        setCitas(lista);
        setLoading(false);
      },
      (error) => {
        if (abortController.signal.aborted) return;
        console.error('Error al obtener citas:', error);
        setLoading(false);
        setCitas([]);
      }
    );

    // Guardar el paciente seleccionado para futuras sesiones
    AsyncStorage.setItem('@id_paciente_actual', pacienteSeleccionado).catch(console.error);

    // Cleanup: abortar cualquier callback pendiente y eliminar listener
    return () => {
      abortController.abort();
      unsubscribe();
    };
  }, [pacienteSeleccionado]);

  const handlePacienteChange = useCallback((value: string) => {
    setPacienteSeleccionado(value);
  }, []);

  const [modalVisible, setModalVisible] = useState(false);
  const [citaEditando, setCitaEditando] = useState<any>(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const verificarDisponibilidad = async (fecha: string, hora: string): Promise<boolean> => {
    try {
      const citasRef = ref(db, 'citas');
      const snapshot = await get(citasRef);
      if (!snapshot.exists()) return true;
      const data = snapshot.val();
      const colision = Object.values(data).some((cita: any) =>
        cita.fecha === fecha &&
        cita.hora === hora &&
        cita.estado !== 'Cancelada' &&
        cita.id !== citaEditando?.id // evitar colisión consigo misma
      );
      return !colision;
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      return false;
    }
  };

  const reagendarCita = async () => {
    if (!citaEditando || !nuevaFecha || !nuevaHora) return;

    // Validar disponibilidad
    const disponible = await verificarDisponibilidad(nuevaFecha, nuevaHora);
    if (!disponible) {
      Alert.alert("Horario ocupado", "Ya existe otra cita activa en ese horario.");
      return;
    }

     try {
      const citaRef = ref(db, `citas/${citaEditando.id}`);
      await update(citaRef, {
        fecha: nuevaFecha,
        hora: nuevaHora,
        estado: 'Reagendada',
        updatedAt: new Date().toISOString()
      });

      // Registrar en bitácora
      await registrarBitacora(
        citaEditando.pacienteId,
        'Cita Reagendada',
        `De ${citaEditando.fecha} ${citaEditando.hora} → ${nuevaFecha} ${nuevaHora}`
      );

      Alert.alert('Éxito', 'Cita reagendada correctamente');
      setModalVisible(false);
      setCitaEditando(null);
    } catch (error) {
      console.error('Error al actualizar la cita:', error);
      Alert.alert('Error', 'No se pudo reagendar la cita');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Citas</Text>
        <Text style={styles.subtitle}>Selecciona un paciente para ver sus registros</Text>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={pacienteSeleccionado}
          onValueChange={handlePacienteChange}
          style={styles.picker}
        >
          <Picker.Item label="-- Seleccione un paciente --" value="" />
          {pacientes.map((p) => (
            <Picker.Item
              key={p.id}
              label={`${p.nombre} ${p.apellido || ''}`.trim()}
              value={p.id}
            />
          ))}
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={citas}
          contentContainerStyle={{ padding: 20 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.citaCard}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateText}>{item.fecha || 'Sin fecha'}</Text>
                <Text style={styles.timeText}>{item.hora || '--:--'}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.motivo}>{item.motivo || 'Consulta general'}</Text>
                <Text
                  style={[
                    styles.status,
                    { color: item.status === 'concluida' ? '#34C759' : '#FF9500' },
                  ]}
                >
                  ● {item.status ? item.status.toUpperCase() : 'PENDIENTE'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.reagendarBtn}
                onPress={() => {
                  setCitaEditando(item);
                  setNuevaFecha(item.fecha);
                  setNuevaHora(item.hora);
                  setModalVisible(true);
                }}>
                <Text style={styles.reagendarText}>Reagendar</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            pacienteSeleccionado ? (
              <Text style={styles.empty}>No se encontraron citas para este paciente.</Text>
            ) : null
          }
        />
      )}
      {modalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reagendar cita</Text>
              
              <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
                <Text>{nuevaFecha || 'Seleccionar fecha'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dateSelector} onPress={() => setShowTimePicker(true)}>
                <Text>{nuevaHora || 'Seleccionar hora'}</Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setNuevaFecha(selectedDate.toLocaleDateString('es-MX'));
                    }
                  }}
                />
              )}
              
              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) {
                      const horas = selectedTime.getHours().toString().padStart(2, '0');
                      const minutos = selectedTime.getMinutes().toString().padStart(2, '0');
                      setNuevaHora(`${horas}:${minutos}`);
                    }
                  }}
                />
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)}>
                  <Text>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnConfirmar} onPress={reagendarCita}>
                  <Text style={{ color: '#FFF' }}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

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
    overflow: 'hidden',
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
    shadowRadius: 2,
  },
  dateBadge: {
    width: 90,
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#F2F2F7',
    paddingRight: 10,
  },
  dateText: { fontSize: 14, fontWeight: 'bold', color: '#1C1C1E' },
  timeText: { fontSize: 12, color: '#8E8E93' },
  info: { flex: 1, paddingLeft: 15 },
  motivo: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  status: { fontSize: 12, fontWeight: 'bold', marginTop: 5 },
  empty: { textAlign: 'center', marginTop: 40, color: '#8E8E93', fontSize: 16 },
  reagendarBtn: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  reagendarText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  dateSelector: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  btnCancelar: {
    backgroundColor: '#CCC',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  btnConfirmar: {
    backgroundColor: '#FF9500',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
});