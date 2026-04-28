import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Información del Sistema</Text>
      <View style={styles.separator} />
      
      <Text style={styles.text}>
        GediatricApp v1.0{"\n"}
        Materia: Dispositivos Móviles 2
      </Text>

      {/* Usamos router.back() para cerrar el modal correctamente */}
      <Pressable onPress={() => router.back()} style={styles.button}>
        <Text style={styles.buttonText}>Cerrar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  separator: { marginVertical: 30, height: 1, width: '80%', backgroundColor: '#eee' },
  text: { textAlign: 'center', fontSize: 16, color: '#666', marginBottom: 20 },
  button: { backgroundColor: '#1976d2', padding: 15, borderRadius: 10, width: '100%' },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});