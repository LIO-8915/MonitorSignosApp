import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker'; // Asegúrate de instalarlo: npx expo install @react-native-picker/picker
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SyncService } from '../services/syncService'; // Importamos tu servicio corregido

export default function PruebasMenu() {
  // --- Estados para la vinculación de pacientes ---
  const [pacientes, setPacientes] = useState<any[]>([]); // Lista de pacientes desde Firebase
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null); // Objeto completo del paciente seleccionado
  const [loading, setLoading] = useState(true);

  // Mapeo de rutas de las pruebas
  const rutasPruebas: [number, string, string, string, string][] = [
    [20, '/Prueba20Entorno', 'Valoración Entorno', 'home', '#607D8B'],
    [19, '/Prueba19Maltrato', 'Detección Maltrato', 'warning', '#E91E63'],
    [18, '/Prueba18OARSSScreen', 'Recursos Sociales', 'people', '#9C27B0'],
    [15, '/Prueba15MNA-SF', 'Nutrición (MNA-SF)', 'restaurant', '#4CAF50'],
    [13, '/Prueba13Auditiva', 'Capacidad Auditiva', 'ear', '#00BCD4'],
    [12, '/Prueba12Norton', 'Escaras (Norton)', 'body', '#FF9800'],
    [11, '/Prueba11Braden', 'Escaras (Braden)', 'shield', '#FF5722'],
    [8, '/Prueba8Lawton', 'Act. Instrumentales', 'construct', '#795548'],
    [7, '/Prueba7KatzIndex', 'Act. Básicas (Katz)', 'walk', '#3F51B5'],
    [6, '/Prueba6CESD7Test', 'Depresión (CESD-7)', 'sad', '#2196F3'],
    [5, '/Prueba5Formulario', 'Formulario General', 'document-text', '#009688'],
    [4, '/Prueba4Moca', 'Cognición (MoCA)', 'bulb', '#673AB7'],
    [3, '/Prueba3Minimental', 'Minimental (MMSE)', 'fitness', '#f44336']
  ];

  // 1. Cargar pacientes al montar el componente para el Picker
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { listaPacientes } = await SyncService.syncFromFirebase(); // Usamos tu método de sincronización
        setPacientes(listaPacientes);
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los pacientes.");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const navegarAPrueba = (ruta: string) => {
    // Verificación de seguridad: No avanzar si no hay un paciente seleccionado
    if (!pacienteSeleccionado) {
      Alert.alert('Atención', 'Debe seleccionar un paciente manualmente antes de realizar una prueba.');
      return;
    }

    if (ruta) {
      // Pasamos el ID y nombre del paciente vinculado a la prueba elegida
      router.push({
        pathname: ruta as any,
        params: { 
          pacienteId: pacienteSeleccionado.id, 
          nombrePaciente: pacienteSeleccionado.nombre 
        }
      });
    } else {
      Alert.alert('Prueba no disponible', 'La prueba aún no está implementada.');
    }
  };

  return (
    <ScrollView style={styles.mainContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Menú de Pruebas</Text>
        
        {/* --- Selector de Paciente (Picker) --- */}
        <View style={styles.selectorContainer}>
          <Text style={styles.labelSelector}>Seleccionar Paciente:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={pacienteSeleccionado?.id}
              onValueChange={(itemValue) => {
                const seleccionado = pacientes.find(p => p.id === itemValue);
                setPacienteSeleccionado(seleccionado);
              }}
            >
              <Picker.Item label="-- Seleccione un paciente --" value={null} color="#999" />
              {pacientes.map((paciente) => (
                <Picker.Item 
                  key={paciente.id} 
                  label={`${paciente.nombre} ${paciente.apellido || ''}`} 
                  value={paciente.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        <Text style={styles.subtitulo}>
          Evaluando a: <Text style={styles.pacienteNombre}>
            {pacienteSeleccionado ? pacienteSeleccionado.nombre : 'Ninguno'}
          </Text>
        </Text>
      </View>

      {/* Renderizado de Cards de Pruebas */}
      {rutasPruebas.map(([numero, ruta, nombre, icono, color]) => (
        <TouchableOpacity
          key={numero}
          style={[styles.card, !pacienteSeleccionado && { opacity: 0.5 }]} // Visualmente desactivado si no hay paciente
          onPress={() => navegarAPrueba(ruta)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Ionicons name={icono as any} size={24} color="#fff" />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.labelPrueba}>PRUEBA {numero}</Text>
            <Text style={styles.nombrePrueba}>{nombre}</Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>GediatricApp - Proyecto Móviles 2</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f2f5f8',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 25,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a2a3a',
    marginBottom: 15,
  },
  selectorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#dcdde1',
  },
  labelSelector: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  pickerWrapper: {
    height: 50,
    justifyContent: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#666',
  },
  pacienteNombre: {
    fontWeight: 'bold',
    color: '#3498db',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  labelPrueba: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#95a5a6',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  nombrePrueba: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 2,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#bdc3c7',
  },
});