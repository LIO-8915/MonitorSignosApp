import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SyncService } from '../services/syncService';

interface Paciente {
  id: string;
  nombre: string;
  apellido?: string;
  edad: string;
  pacienteId?: string;   // ID manual (cédula)
  peso?: string;
  estatura?: string;
  timestamp?: string;
}

export default function PacientesScreen() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const cargarPacientes = useCallback(async () => {
    try {
      setLoading(true);
      const lista = await SyncService.getPacientes(); // Trae de Firebase + caché local
      setPacientes(lista);
    } catch (error) {
      console.error("Error cargando pacientes:", error);
      Alert.alert("Error", "No se pudieron cargar los pacientes");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    cargarPacientes();
  }, []);

  const handleEliminar = async () => {
    if (!selectedPaciente) return;

    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de eliminar a ${selectedPaciente.nombre} ${selectedPaciente.apellido || ''}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const { success } = await SyncService.deletePaciente(selectedPaciente.id);
            if (success) {
              Alert.alert("Éxito", "Paciente eliminado correctamente");
              setModalVisible(false);
              cargarPacientes(); // Refrescar la lista
            } else {
              Alert.alert("Error", "No se pudo eliminar el paciente");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Paciente }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedPaciente(item);
        setModalVisible(true);
      }}
    >
      <Text style={styles.nombre}>
        {item.nombre} {item.apellido}
      </Text>
      <Text style={styles.detalle}>Edad: {item.edad} años</Text>
      {item.pacienteId && <Text style={styles.detalle}>ID: {item.pacienteId}</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={pacientes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? "Cargando pacientes..." : "No hay pacientes registrados"}
          </Text>
        }
        refreshing={loading}
        onRefresh={cargarPacientes}
      />

      {/* Botón flotante para agregar nuevo paciente */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/RegistroPacientes')}
      >
        <Text style={styles.fabText}>+ Nuevo Paciente</Text>
      </TouchableOpacity>

      {/* Modal de detalles del paciente */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPaciente && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedPaciente.nombre} {selectedPaciente.apellido}
                </Text>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Edad:</Text>
                  <Text style={styles.modalValue}>{selectedPaciente.edad} años</Text>
                </View>
                {selectedPaciente.pacienteId && (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Cédula / ID:</Text>
                    <Text style={styles.modalValue}>{selectedPaciente.pacienteId}</Text>
                  </View>
                )}
                {selectedPaciente.peso && (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Peso:</Text>
                    <Text style={styles.modalValue}>{selectedPaciente.peso} kg</Text>
                  </View>
                )}
                {selectedPaciente.estatura && (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Estatura:</Text>
                    <Text style={styles.modalValue}>{selectedPaciente.estatura} cm</Text>
                  </View>
                )}
                {selectedPaciente.timestamp && (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Registrado:</Text>
                    <Text style={styles.modalValue}>
                      {new Date(selectedPaciente.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnEliminar]}
                    onPress={handleEliminar}
                  >
                    <Text style={styles.btnText}>Eliminar paciente</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnCerrar]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.btnText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F5F8' },
  listContainer: { padding: 16, flexGrow: 1 },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  nombre: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },
  detalle: { fontSize: 14, color: '#7F8C8D', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#95A5A6' },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  fabText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#2C3E50' },
  modalDetailRow: { flexDirection: 'row', marginBottom: 12 },
  modalLabel: { width: '35%', fontWeight: 'bold', color: '#7F8C8D' },
  modalValue: { flex: 1, color: '#2C3E50' },
  modalButtons: { marginTop: 24, flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  btnEliminar: { backgroundColor: '#E74C3C' },
  btnCerrar: { backgroundColor: '#95A5A6' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
});