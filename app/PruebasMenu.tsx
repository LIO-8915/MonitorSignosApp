import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Interfaz para el tipado de las pruebas
interface PruebaItem {
  id: string;
  titulo: string;
  descripcion: string;
  ruta: string; // Nombre exacto en tu Stack/Drawer Navigator
}

const LISTA_PRUEBAS: PruebaItem[] = [
  { 
    id: '1', 
    titulo: 'Valoración Nutricional (MNA)', 
    descripcion: 'Mini Nutritional Assessment para pacientes geriátricos.',
    ruta: 'QuizMNA' 
  },
  { 
    id: '2', 
    titulo: 'Seguimiento de Signos Vitales', 
    descripcion: 'Captura y visualización de frecuencia cardíaca, SPO2 y temperatura.',
    ruta: 'SignosVitales' 
  },
  { 
    id: '3', 
    titulo: 'Evaluación de Movilidad', 
    descripcion: 'Pruebas de equilibrio y desplazamiento.',
    ruta: 'EvaluacionMovilidad' 
  }
];

export const PruebasMenu = () => {
  const navigation = useNavigation<any>();

  const renderItem = ({ item }: { item: PruebaItem }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate(item.ruta)}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.id}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.cardTitle}>{item.titulo}</Text>
        <Text style={styles.cardDesc}>{item.descripcion}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Colección de Evaluaciones</Text>
      <FlatList
        data={LISTA_PRUEBAS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', margin: 20, color: '#333' },
  listContent: { paddingHorizontal: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    // Sombra para iOS y Android
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  badge: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  badgeText: { color: '#fff', fontWeight: 'bold' },
  info: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  cardDesc: { fontSize: 14, color: '#666', marginTop: 4 }
});

export default PruebasMenu;