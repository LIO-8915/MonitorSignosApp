import { useRouter } from "expo-router";
import { Accelerometer } from "expo-sensors";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PREGUNTAS = [
  {
    id: 1,
    texto: "1. ¿En general, está satisfecho(a) con su vida?",
    valorPositivo: "No",
  },
  {
    id: 2,
    texto: "2. ¿Ha abandonado muchas de sus tareas habituales y aficiones?",
    valorPositivo: "Sí",
  },
  { id: 3, texto: "3. ¿Siente que su vida está vacía?", valorPositivo: "Sí" },
  {
    id: 4,
    texto: "4. ¿Se siente con frecuencia aburrido(a)?",
    valorPositivo: "Sí",
  },
  {
    id: 5,
    texto: "5. ¿Se encuentra de buen humor la mayor parte del tiempo?",
    valorPositivo: "No",
  },
  {
    id: 6,
    texto: "6. ¿Teme que algo malo pueda ocurrirle?",
    valorPositivo: "Sí",
  },
  {
    id: 7,
    texto: "7. ¿Se siente feliz la mayor parte del tiempo?",
    valorPositivo: "No",
  },
  {
    id: 8,
    texto: "8. ¿Con frecuencia se siente desamparado(a), desprotegido(a)?",
    valorPositivo: "Sí",
  },
  {
    id: 9,
    texto:
      "9. ¿Prefiere usted quedarse en casa, más que salir y hacer cosas nuevas?",
    valorPositivo: "Sí",
  },
  {
    id: 10,
    texto:
      "10. ¿Cree que tiene más problemas de memoria que la mayoría de la gente?",
    valorPositivo: "Sí",
  },
  {
    id: 11,
    texto: "11. ¿En estos momentos, piensa que es estupendo estar vivo(a)?",
    valorPositivo: "No",
  },
  {
    id: 12,
    texto: "12. ¿Actualmente se siente un(a) inútil?",
    valorPositivo: "Sí",
  },
  { id: 13, texto: "13. ¿Se siente lleno(a) de energía?", valorPositivo: "No" },
  {
    id: 14,
    texto: "14. ¿Se siente sin esperanza en este momento?",
    valorPositivo: "Sí",
  },
  {
    id: 15,
    texto:
      "15. ¿Piensa que la mayoría de la gente está en mejor situación que usted?",
    valorPositivo: "Sí",
  },
];

export default function FormularioScreen() {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});

  // Referencia para saber cuándo fue el último reseteo y evitar reseteos múltiples continuos
  const ultimoReseteo = React.useRef(0);

  React.useEffect(() => {
    // Configurar la sensibilidad (frecuencia de actualización en ms)
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(
      (accelerometerData: { x: number; y: number; z: number }) => {
        const { x, y, z } = accelerometerData;

        // Calcular la aceleración total usando la magnitud del vector (gravedad es ~1g)
        const aceleracionTotal = Math.sqrt(x * x + y * y + z * z);

        // Si la aceleración total es mayor a un umbral (ej. 2.0g), consideramos que es un "sacudón"
        const UMBRAL_SACUDIDA = 2.0;

        if (aceleracionTotal > UMBRAL_SACUDIDA) {
          const ahora = Date.now();
          // Esperar al menos 2 segundos entre reseteos para no estar disparando la alerta repetidamente
          if (ahora - ultimoReseteo.current > 2000) {
            ultimoReseteo.current = ahora;

            setRespuestas({}); // Borrar todas las respuestas
            Alert.alert(
              "Formulario Reiniciado",
              "Has sacudido el dispositivo y se han borrado las respuestas seleccionadas.",
            );
          }
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const seleccionarRespuesta = (id: number, respuesta: string) => {
    setRespuestas({ ...respuestas, [id]: respuesta });
  };

  const calcularYRegresar = () => {
    if (Object.keys(respuestas).length < 15) {
      Alert.alert(
        "Incompleto",
        "Por favor responda todas las preguntas antes de finalizar.",
      );
      return;
    }

    let puntaje = 0;
    PREGUNTAS.forEach((pregunta) => {
      if (respuestas[pregunta.id] === pregunta.valorPositivo) {
        puntaje += 1;
      }
    });

    const diagnostico =
      puntaje >= 5 ? "Presencia de síntomas depresivos" : "Normal";

    Alert.alert(
      "Resultado de Evaluación",
      `Puntaje: ${puntaje} / 15\nInterpretación: ${diagnostico}`,
      [
        {
          text: "OK",
          onPress: () => {
             setRespuestas({});
          }
        }
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.instrucciones}>
        Indicaciones: Responda tomando en cuenta únicamente cómo se ha sentido
        durante la última semana.
      </Text>

      {PREGUNTAS.map((pregunta) => (
        <View key={pregunta.id} style={styles.preguntaContainer}>
          <Text style={styles.textoPregunta}>{pregunta.texto}</Text>

          <View style={styles.botonesContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.botonRespuesta,
                respuestas[pregunta.id] === "Sí" && styles.botonSeleccionado,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              onPress={() => seleccionarRespuesta(pregunta.id, "Sí")}
            >
              <Text
                style={
                  respuestas[pregunta.id] === "Sí"
                    ? styles.textoBlanco
                    : styles.textoOscuro
                }
              >
                Sí
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.botonRespuesta,
                respuestas[pregunta.id] === "No" && styles.botonSeleccionado,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              onPress={() => seleccionarRespuesta(pregunta.id, "No")}
            >
              <Text
                style={
                  respuestas[pregunta.id] === "No"
                    ? styles.textoBlanco
                    : styles.textoOscuro
                }
              >
                No
              </Text>
            </Pressable>
          </View>
        </View>
      ))}

      <Pressable
        style={({ pressed }) => [
          styles.botonEvaluar,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={calcularYRegresar}
      >
        <Text style={styles.textoEvaluar}>Finalizar Evaluacion</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 15 },
  instrucciones: {
    backgroundColor: "#DBEAFE",
    padding: 15,
    borderRadius: 8,
    color: "#1E40AF",
    marginBottom: 20,
    fontStyle: "italic",
  },
  preguntaContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  textoPregunta: { fontSize: 16, color: "#374151", marginBottom: 15 },
  botonesContainer: { flexDirection: "row", gap: 10 },
  botonRespuesta: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  botonSeleccionado: {
    backgroundColor: "#60A5FA",
    borderColor: "#60A5FA",
  },
  textoOscuro: { color: "#374151", fontWeight: "bold" },
  textoBlanco: { color: "#FFFFFF", fontWeight: "bold" },
  botonEvaluar: {
    backgroundColor: "#3B82F6",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  textoEvaluar: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
});
