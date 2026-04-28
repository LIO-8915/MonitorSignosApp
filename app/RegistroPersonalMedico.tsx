import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SyncService } from '../services/syncService';

interface Medico {
  id?: string;
  nombre: string;
  especialidad: string;
  cedula: string;
}

export default function RegistroPersonalMedico() {
  // --- ESTADOS PARA EL FORMULARIO ---
  const [nombre, setNombre] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [cedula, setCedula] = useState('');
  const [cargando, setCargando] = useState(false);

  // --- ESTADOS PARA LA LISTA ---
  const [medicos, setMedicos] = useState<Medico[]>([]);

  useEffect(() => {
    cargarMedicos();
  }, []);

  const cargarMedicos = async () => {
    try {
      const data = await SyncService.getLocalData();
      setMedicos(data.medicos);
    } catch (error) {
      console.error("Error al cargar médicos locales:", error);
    }
  };

  const handleGuardar = async () => {
    if (!nombre || !especialidad || !cedula) {
      Alert.alert("Campos obligatorios", "Por favor llena todos los campos.");
      return;
    }

    try {
      //setCargando(true);
      // IMPORTANTE: Enviamos el objeto con el nombre de propiedad 'nombre'
      await SyncService.addMedico({
        nombre: nombre,
        especialidad: especialidad,
        cedula: cedula
      });
      
      Alert.alert("Éxito", "Médico registrado");
      setNombre('');
      setEspecialidad('');
      setCedula('');
      await cargarMedicos(); // Esto refresca la lista de la pantalla actual
    } 
    catch (error) {
      Alert.alert("Error", "No se pudo conectar con Firebase");
    } 
    finally {
      setCargando(false);
    }
  };

  const renderMedico = ({ item }: { item: Medico }) => (
    <View style={styles.medicoCard}>
      <View style={styles.infoContainer}>
        <Text style={styles.medicoName}>{item.nombre}</Text>
        <Text style={styles.medicoSub}>{item.especialidad} • Cédula: {item.cedula}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.title}>Registro de Personal Médico</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nombre Completo"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Especialidad (ej. Geriatra, Enfermero)"
          value={especialidad}
          onChangeText={setEspecialidad}
        />
        <TextInput
          style={styles.input}
          placeholder="Cédula Profesional / ID"
          value={cedula}
          onChangeText={setCedula}
        />

        <TouchableOpacity 
          style={[styles.btnSave, cargando && { opacity: 0.7 }]} 
          onPress={handleGuardar}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnText}>Registrar Médico</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.subtitle}>Personal Registrado</Text>
        <FlatList
          data={medicos}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderMedico}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay personal médico registrado aún.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', padding: 20 },
  formCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
    marginTop: 10
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#1C1C1E', textAlign: 'center' },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16
  },
  btnSave: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  listContainer: { flex: 1 },
  subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#3A3A3C' },
  medicoCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#34C759'
  },
  infoContainer: { flex: 1 },
  medicoName: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  medicoSub: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 20 }
});