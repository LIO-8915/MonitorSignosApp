// import { Ionicons } from '@expo/vector-icons';
// import { Link } from 'expo-router';
// import React from 'react';
// import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// const PRUEBAS = [
//   { id: '20', nombre: 'Valoración de Entorno', archivo: 'Prueba 20 entorno', icono: 'home', color: '#607D8B' },
//   { id: '19', nombre: 'Detección de Maltrato', archivo: 'Prueba 19 Maltrato', icono: 'warning', color: '#E91E63' },
//   { id: '18', nombre: 'Recursos Sociales (OARSS)', archivo: 'Prueba 18 OARSSScreen', icono: 'people', color: '#9C27B0' },
//   { id: '15', nombre: 'Nutrición (MNA-SF)', archivo: 'Prueba 15 MNA-SF', icono: 'restaurant', color: '#4CAF50' },
//   { id: '13', nombre: 'Capacidad Auditiva', archivo: 'Prueba 13 Auditiva', icono: 'ear', color: '#00BCD4' },
//   { id: '12', nombre: 'Riesgo de Escaras (Norton)', archivo: 'Prueba 12 Norton', icono: 'body', color: '#FF9800' },
//   { id: '11', nombre: 'Riesgo de Escaras (Braden)', archivo: 'Prueba 11 Braden', icono: 'shield', color: '#FF5722' },
//   { id: '8', nombre: 'Actividades (Lawton)', archivo: 'Prueba 8 Lawton', icono: 'construct', color: '#795548' },
//   { id: '7', nombre: 'Actividades Básicas (Katz)', archivo: 'Prueba 7 KatzIndex', icono: 'walk', color: '#3F51B5' },
//   { id: '6', nombre: 'Depresión (CESD-7)', archivo: 'Prueba 6 CESD7Test', icono: 'sad', color: '#2196F3' },
//   { id: '5', nombre: 'Formulario General', archivo: 'Prueba 5 formulario', icono: 'document-text', color: '#009688' },
//   { id: '4', nombre: 'Cognición (MoCA)', archivo: 'Prueba 4 moca', icono: 'bulb', color: '#673AB7' },
//   { id: '3', nombre: 'Minimental (MMSE)', archivo: 'Prueba 3 minimental 1', icono: 'fitness', color: '#f44336' },
// ];

// export default function PruebasMenuScreen() {
//   const pruebas = 
//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.content}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Evaluaciones Clínicas</Text>
//       </View>

//       {PRUEBAS.map((item) => (
//         /* Usar Link con href directo suele ser más compatible con nombres con espacios */
//         <Link key={item.id} href={`/${item.archivo}` as any} asChild>
//           <TouchableOpacity style={styles.card} activeOpacity={0.7}>
//             <View style={[styles.iconBox, { backgroundColor: item.color }]}>
//               <Text style={{color: '#fff', fontWeight: 'bold'}}>{item.id}</Text>
//             </View>

//             <View style={styles.info}>
//               <Text style={styles.nameLabel}>{item.nombre}</Text>
//             </View>

//             <Ionicons name="chevron-forward" size={20} color="#CCC" />
//           </TouchableOpacity>
//         </Link>
//       ))}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F2F4F7' },
//   content: { padding: 20, paddingBottom: 40 },
//   header: { marginBottom: 25 },
//   headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#1F2937' },
//   headerSub: { fontSize: 14, color: '#6B7280', marginTop: 4 },
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//   },
//   iconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
//   info: { flex: 1, marginLeft: 15 },
//   idLabel: { fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1 },
//   nameLabel: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 2 },
//   footer: { marginTop: 20, alignItems: 'center' },
//   footerText: { fontSize: 12, color: '#9CA3AF' }
// });

// app/PruebasMenu.tsx (o donde tengas el componente)
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PruebasMenu() {
  // ============================================================
  // OPCIÓN 1: MAPEO A PANTALLAS SEPARADAS (Prueba1, Prueba2, ...)
  // ============================================================
  const rutasPruebas: [number, string, string, string, string][] = [
  // [ID, Ruta, Nombre Visible, Icono, Color]
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

  const navegarAPrueba = (ruta: string) => {
    if (ruta) {
      // Pasamos el ID del paciente vinculado a la prueba elegida
      router.push({
        pathname: ruta as any,
        params: { pacienteId, nombrePaciente }
      });
    } else {
      Alert.alert('Prueba no disponible', 'La prueba aún no está implementada.');
    }
  };

  // Lista de números de prueba (1..10)
  const pruebas = Object.keys(rutasPruebas).map(Number); // [1,2,...,10]
  const { pacienteId, nombrePaciente } = useLocalSearchParams();

  return (
    <ScrollView style={styles.mainContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Menú de Pruebas</Text>
        <Text style={styles.subtitulo}>
          Evaluando a: <Text style={styles.pacienteNombre}>{nombrePaciente || 'Sin seleccionar'}</Text>
        </Text>
      </View>

      {rutasPruebas.map(([numero, ruta, nombre, icono, color]) => (
        <TouchableOpacity
          key={numero}
          style={styles.card}
          onPress={() => navegarAPrueba(ruta)}
          activeOpacity={0.7}
        >
          {/* Contenedor del Icono */}
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Ionicons name={icono as any} size={24} color="#fff" />
          </View>

          {/* Información de la Prueba */}
          <View style={styles.infoContainer}>
            <Text style={styles.labelPrueba}>PRUEBA {numero}</Text>
            <Text style={styles.nombrePrueba}>{nombre}</Text>
          </View>

          {/* Indicador lateral */}
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>GediatricApp - 8vo Semestre</Text>
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
    paddingHorizontal: 5,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a2a3a',
  },
  subtitulo: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
    // Sombras para Android/Redmi
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