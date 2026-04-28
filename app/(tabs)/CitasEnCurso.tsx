import { equalTo, onValue, orderByChild, query, ref, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../services/firebase';

export default function CitasEnCurso() {
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const citasRef = query(
      ref(db, 'citas'), 
      orderByChild('status'), 
      equalTo('en curso')
    );

    const unsubscribe = onValue(citasRef, (snapshot) => {
      const lista: any[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(key => {
          lista.push({ id: key, ...data[key] });
        });
      }
      setCitas(lista);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const finalizarCita = async (id: string) => {
    try {
      await update(ref(db, `citas/${id}`), { status: 'concluida' });
    } catch (error) {
      console.error("Error al finalizar:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Citas en Curso</Text>
      {loading ? <ActivityIndicator size="large" color="#007AFF" /> : (
        <FlatList
          data={citas}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.paciente}>Paciente: {item.pacienteId}</Text>
                <Text style={styles.motivo}>{item.motivo}</Text>
                <Text style={styles.hora}>{item.hora} hrs - {item.fecha}</Text>
              </View>
              <TouchableOpacity style={styles.finalizarBtn} onPress={() => finalizarCita(item.id)}>
                <Text style={styles.btnText}>Finalizar</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No hay citas activas.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F4F7F9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 2 },
  paciente: { fontWeight: 'bold', fontSize: 16 },
  motivo: { color: '#666', marginVertical: 4 },
  hora: { color: '#007AFF', fontSize: 13 },
  finalizarBtn: { backgroundColor: '#34C759', padding: 10, borderRadius: 8 },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});