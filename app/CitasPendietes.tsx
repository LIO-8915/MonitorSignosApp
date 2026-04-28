import { MaterialCommunityIcons } from '@expo/vector-icons';
import { equalTo, onValue, orderByChild, query, ref, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../services/firebase';

const CitasPendientes = () => {
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Consultamos solo las citas que tengan estado "Agendado"
    const citasRef = query(
      ref(db, 'citas'), 
      orderByChild('status'), 
      equalTo('Agendado')
    );

    const unsubscribe = onValue(citasRef, (snapshot) => {
      const lista: any[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(key => {
          lista.push({ id: key, ...data[key] });
        });
        // Ordenar por hora o por creación
        lista.sort((a, b) => a.hora.localeCompare(b.hora));
      }
      setCitas(lista);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const iniciarAtencion = async (id: string, pacienteNombre: string) => {
    Alert.alert(
      "Iniciar Atención",
      `¿Deseas pasar al paciente a "En curso"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          onPress: async () => {
            try {
              const citaRef = ref(db, `citas/${id}`);
              await update(citaRef, { status: 'en curso' });
              // Opcional: Aquí podrías guardar el ID en AsyncStorage para que 
              // la app sepa a quién estás atendiendo actualmente.
            } catch (error) {
              Alert.alert("Error", "No se pudo actualizar el estado.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Citas Pendientes</Text>
      <Text style={styles.subHeader}>Lista de espera para hoy</Text>

      <FlatList
        data={citas}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <View style={styles.timeBadge}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#007AFF" />
                <Text style={styles.timeText}>{item.hora}</Text>
              </View>
              <Text style={styles.pacienteTitle}>ID Paciente: {item.pacienteId}</Text>
              <Text style={styles.motivoText}>{item.motivo || 'Consulta general'}</Text>
            </View>

            <TouchableOpacity 
              style={styles.startBtn} 
              onPress={() => iniciarAtencion(item.id, item.pacienteId)}
            >
              <MaterialCommunityIcons name="play-circle" size={24} color="#FFF" />
              <Text style={styles.btnText}>Atender</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-check" size={60} color="#CCC" />
            <Text style={styles.emptyText}>No hay citas pendientes por ahora.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1C1C1E', marginTop: 10 },
  subHeader: { fontSize: 16, color: '#8E8E93', marginBottom: 20 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  info: { flex: 1 },
  timeBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#E5F1FF', 
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8
  },
  timeText: { marginLeft: 5, color: '#007AFF', fontWeight: 'bold', fontSize: 12 },
  pacienteTitle: { fontSize: 17, fontWeight: 'bold', color: '#1C1C1E' },
  motivoText: { fontSize: 14, color: '#666', marginTop: 2 },
  startBtn: {
    backgroundColor: '#34C759',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 5 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#8E8E93', marginTop: 10, fontSize: 16 }
});

export default CitasPendientes;