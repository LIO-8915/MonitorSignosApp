import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet, Text, View
} from 'react-native';
// CORRECCIÓN: Usar expo-sensors en lugar de react-native-sensors
import { useFocusEffect } from '@react-navigation/native';
import { Accelerometer } from 'expo-sensors';
import { SyncService } from '../services/syncService';

const CESD7Test = ({ navigation }: any) => {
  const { pacienteId, nombrePaciente } = useLocalSearchParams();
  const [resultado, setResultado] = useState<number>(0);

  const finalizarPrueba = async (puntaje: number,diagnostico: string) => {
      setResultado(puntaje);
      console.log(resultado);
      if (!pacienteId) {
      Alert.alert("Error", "No hay un paciente vinculado a esta sesión.");
      return;
      }

      try {
      // 3. Guardar en Firebase usando tu SyncService [cite: 2]
      // Nota: Puedes agregar un método 'addResultadoPrueba' en tu syncService.ts similar a 'addPaciente'
      const response = await SyncService.addResultadoPrueba(String(pacienteId), String(nombrePaciente), "Prueba 6 CESD 7 Test", resultado, String(diagnostico)); 
      
      if (response.success) {
          Alert.alert("Éxito", `Prueba guardada para el paciente: ${nombrePaciente}`);
          router.replace('/PruebasMenu'); // Regresar al menú tras finalizar
      }
      } catch (error) {
      Alert.alert("Error", "No se pudo sincronizar con Firebase.");
      }
  };

  const router = useRouter();
  const [respuestas, setRespuestas] = useState(new Array(7).fill(null));

  useFocusEffect(
    useCallback(() => {
      // No reseteamos automáticamente al entrar para no perder progreso accidentalmente
    }, [])
  );

  useEffect(() => {
    let subscription: any;

    // Configuración del acelerómetro estilo Expo
    const subscribe = async () => {
      Accelerometer.setUpdateInterval(150);
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        
        // Umbral de movimiento para limpiar el formulario (Shake)
        if (magnitude > 2.5) { 
          setRespuestas(new Array(7).fill(null));
        }
      });
    };

    if (Platform.OS !== 'web') {
      subscribe();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const preguntas = [
    { id: 0, texto: "1. ¿Sentía como si no pudiera quitarse la tristeza?", tipo: 'normal' },
    { id: 1, texto: "2. ¿Le costaba concentrarse en lo que estaba haciendo?", tipo: 'normal' },
    { id: 2, texto: "3. ¿Se sintió deprimido/a?", tipo: 'normal' },
    { id: 3, texto: "4. ¿Le parecía que todo lo que hacía era un esfuerzo?", tipo: 'normal' },
    { id: 4, texto: "5. ¿No durmió bien?", tipo: 'normal' },
    { id: 5, texto: "6. ¿Disfrutó de la vida?", tipo: 'invertido' },
    { id: 6, texto: "7. ¿Se sintió triste?", tipo: 'normal' },
  ];

  const opciones = [
    { label: 'Rara vez', val: 0, valInv: 3 },
    { label: 'Pocas veces', val: 1, valInv: 2 },
    { label: 'Frecuente', val: 2, valInv: 1 },
    { label: 'Siempre', val: 3, valInv: 0 },
  ];

  const seleccionarOpcion = (preguntaIdx: number, puntos: number) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaIdx] = puntos;
    setRespuestas(nuevasRespuestas);
  };

  const calcularResultado = () => {
    if (respuestas.includes(null)) {
      Alert.alert("Atención", "Por favor responde todas las preguntas.");
      return;
    }

    const puntajeTotal = respuestas.reduce((a, b) => a + (b || 0), 0);
    const interpretacion = puntajeTotal < 5 ? "Normal" : "Síntomas significativos";

    Alert.alert(
      "Resultado",
      `Puntaje: ${puntajeTotal} puntos\n${interpretacion}`,
      [{
        text: "FINALIZAR",
        onPress: () => finalizarPrueba(puntajeTotal,interpretacion)        
      }]
    );
    console.log(puntajeTotal);
  };

  return (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>Evaluación CESD-7</Text>
      <Text style={styles.descriptionText}>
        Esta prueba psicológica evalúa los síntomas de depresión en adultos.
        Conteste con la opción que mejor describa su situación en los últimos 7 días.
      </Text>

      {preguntas.map((item, index) => (
        <View key={item.id} style={styles.cardPregunta}>
          <Text style={styles.preguntaText}>{item.texto}</Text>
          <View style={styles.opcionesContainer}>
            {opciones.map((opt) => {
              const valorAsignado = item.tipo === 'normal' ? opt.val : opt.valInv;
              // Buscamos si el valor almacenado coincide con el valor que esta opción otorga
              const esSeleccionado = respuestas[index] === valorAsignado;

              return (
                <Pressable
                  key={opt.label}
                  style={({ pressed }) => [
                    styles.opcionBtn,
                    esSeleccionado && styles.opcionSelected,
                    pressed && { opacity: 0.7 }
                  ]}
                  onPress={() => seleccionarOpcion(index, valorAsignado)}
                >
                  <Text style={[styles.opcionTxt, esSeleccionado && styles.opcionTxtSelected]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && { backgroundColor: '#5B21B6' }
        ]}
        onPress={calcularResultado}
      >
        <Text style={styles.buttonText}>CALCULAR</Text>
      </Pressable>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  formContainer: { flex: 1, padding: 20, backgroundColor: '#FFF' },
  formTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#111827' },
  descriptionText: { fontSize: 14, color: '#6B7280', marginBottom: 25, lineHeight: 20 },
  cardPregunta: { marginBottom: 30 },
  preguntaText: { fontSize: 17, color: '#374151', marginBottom: 15, fontWeight: '500' },
  opcionesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  opcionBtn: {
    borderColor: '#E5E7EB',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20
  },
  opcionSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED'
  },
  opcionTxt: { color: '#6B7280', fontSize: 13 },
  opcionTxtSelected: { color: '#FFF', fontWeight: '600' },
  primaryButton: {
    backgroundColor: '#7C3AED',
    padding: 18,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});

export default CESD7Test;