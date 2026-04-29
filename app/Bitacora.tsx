import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../services/firebase';

export default function BitacoraScreen() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bitacoraRef = ref(db, 'bitacora');
    const unsubscribe = onValue(bitacoraRef, (snapshot) => {
      const data = snapshot.val();
      const lista = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      lista.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      setEventos(lista);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bitácora de eventos</Text>
      </View>
      {/* Encabezado de tabla */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.fechaHora]}>Fecha/Hora</Text>
        <Text style={[styles.cell, styles.movimiento]}>Movimiento</Text>
        <Text style={[styles.cell, styles.detalles]}>Detalles</Text>
      </View>
      <FlatList
        data={eventos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={[styles.cell, styles.fechaHora]}>
              {item.fecha} {item.hora}
            </Text>
            <Text style={[styles.cell, styles.movimiento]}>{item.movimiento}</Text>
            <Text style={[styles.cell, styles.detalles]}>{item.detalles}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 15, backgroundColor: '#007AFF' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  headerRow: { backgroundColor: '#DDD' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#CCC', paddingVertical: 8 },
  cell: { paddingHorizontal: 8, fontSize: 12 },
  fechaHora: { flex: 1.5 },
  movimiento: { flex: 1.8 },
  detalles: { flex: 2 },
});