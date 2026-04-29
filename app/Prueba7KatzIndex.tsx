import { Accelerometer } from "expo-sensors";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Signika_400Regular,
  Signika_700Bold,
  useFonts,
} from "@expo-google-fonts/signika";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SyncService } from '../services/syncService';

/**
 * KatzIndex.tsx
 * Refactor: Now every question is a component <Question />
 */

type KatzAnswers = {
  bath: "si" | "no" | null;
  dress: "si" | "no" | null;
  toilet: "si" | "no" | null;
  transfer: "si" | "no" | null;
  continence: "si" | "no" | null;
  feeding: "si" | "no" | null;
};

type QuestionProps = {
  title: string;
  description: string;
  value: "si" | "no" | null;
  onChange: (v: "si" | "no") => void;
};

function Question({ title, description, value, onChange }: QuestionProps) {
  return (
    <View>
      <Text style={{ fontFamily: "Signika_700Bold", fontSize: 18 }}>
        {title}
      </Text>

      <View
        style={{
          flexDirection: "row",
          paddingLeft: 8,
          paddingRight: 8,
          paddingTop: 5,
        }}
      >
        <View style={{ flex: 3, paddingRight: 10 }}>
          <Text style={{ fontFamily: "Signika_400Regular", fontSize: 16 }}>
            {description}
          </Text>
        </View>

        <View
          style={{
            width: 100,
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Text style={{ marginBottom: 4, marginRight: 14 }}>Sí</Text>
            <BouncyCheckbox
              size={20}
              useBuiltInState={false}
              isChecked={value === "si"}
              onPress={() => onChange("si")}
            />
          </View>

          <View style={{ alignItems: "center" }}>
            <Text style={{ marginBottom: 4, marginRight: 14 }}>No</Text>
            <BouncyCheckbox
              size={20}
              useBuiltInState={false}
              isChecked={value === "no"}
              onPress={() => onChange("no")}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function KatzIndex({ navigation }: any) {
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
      const response = await SyncService.addResultadoPrueba(String(pacienteId), String(nombrePaciente), "Prueba 7 Indice de Katz", resultado, String(diagnostico)); 
      
      if (response.success) {         
          router.replace('/PruebasMenu'); // Regresar al menú tras finalizar
      }
      } catch (error) {
      Alert.alert("Error", "No se pudo sincronizar con Firebase.");
      }
  };

  const router = useRouter();

  const [answers, setAnswers] = useState<KatzAnswers>({
    bath: null,
    dress: null,
    toilet: null,
    transfer: null,
    continence: null,
    feeding: null,
  });

  const [lastSensorScore, setLastSensorScore] = useState<number | null>(null);

  const [fontsLoaded] = useFonts({
    Signika_400Regular,
    Signika_700Bold,
  });
  if (!fontsLoaded) return null;

  // ---- SensorResultBlock (inline) ----
  function SensorResultBlock({
    onResult,
    lastScore,
  }: {
    onResult: (score: number) => void;
    lastScore: number | null;
  }) {
    const [running, setRunning] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
      return () => {
        Accelerometer.removeAllListeners();
      };
    }, []);

    const run = () => {
      setRunning(true);
      setAnalyzing(true);
      Accelerometer.setUpdateInterval(100);
      const samples: number[] = [];
      const sub = Accelerometer.addListener((data) => {
        const mag = Math.sqrt(
          data.x * data.x + data.y * data.y + data.z * data.z,
        );
        samples.push(mag);
      });

      setTimeout(() => {
        sub && (sub as any).remove && (sub as any).remove();
        Accelerometer.removeAllListeners();
        setRunning(false);
        // simple analysis
        const mean =
          samples.reduce((a, b) => a + b, 0) / Math.max(samples.length, 1);
        const variance =
          samples.reduce((a, b) => a + (b - mean) * (b - mean), 0) /
          Math.max(samples.length, 1);
        let peaks = 0;
        for (let i = 1; i < samples.length - 1; i++) {
          if (
            samples[i] > samples[i - 1] * 1.15 &&
            samples[i] > samples[i + 1] * 1.15 &&
            samples[i] > mean + 0.02
          ) {
            peaks++;
          }
        }
        const score = Math.min(100, Math.round(variance * 1000 + peaks * 10));
        setAnalyzing(false);
        onResult(score);
      }, 7000);
    };

    return (
      <View style={{ marginTop: 12 }}>
        <Pressable
          onPress={run}
          disabled={running}
          style={{
            backgroundColor: running ? "#ccc" : "#e1a9ff",
            padding: 10,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text>
            {running ? "Grabando..." : "Iniciar prueba de transferencia"}
          </Text>
        </Pressable>

        {analyzing && (
          <View style={{ marginTop: 8, alignItems: "center" }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 6 }}>Analizando datos...</Text>
          </View>
        )}

        {lastScore !== null && (
          <Text style={{ marginTop: 8 }}>
            Último resultado: {lastScore} — Transferencias:{" "}
            {answers.transfer ?? "no respondido"}
          </Text>
        )}
      </View>
    );
  }
  // ---- end SensorResultBlock ----

  const handleSensorResult = (score: number) => {
    setLastSensorScore(score);
    if (score > 30) {
      setAnswers((prev) => ({ ...prev, transfer: "si" }));
    } else {
      setAnswers((prev) => ({ ...prev, transfer: "no" }));
    }
  };

  // Test results
  const calcularKatz = () => {
    const values = Object.values(answers);
    const independientes = values.filter((v) => v === "si").length;
    const dependientes = values.filter((v) => v === "no").length;

    let clasificacion = "";

    if (independientes === 6) {
      clasificacion =
        "A - Independencia en todas las actividades básicas de la vida diaria.";
    } else if (independientes === 5) {
      clasificacion =
        "B - Independencia en todas las actividades menos en una.";
    } else if (answers.bath === "no" && independientes === 5) {
      clasificacion =
        "C - Independencia en todo menos bañarse y otra actividad adicional.";
    } else if (answers.bath === "no" && answers.dress === "no") {
      clasificacion =
        "D - Independencia en todo menos bañarse, vestirse y otra actividad adicional.";
    } else if (
      answers.bath === "no" &&
      answers.dress === "no" &&
      answers.toilet === "no"
    ) {
      clasificacion =
        "E - Dependencia en baño, vestido, uso del sanitario y otra actividad adicional.";
    } else if (
      answers.bath === "no" &&
      answers.dress === "no" &&
      answers.toilet === "no" &&
      answers.transfer === "no"
    ) {
      clasificacion =
        "F - Dependencia en baño, vestido, uso del sanitario, transferencias y otra actividad.";
    } else if (dependientes === 6) {
      clasificacion =
        "G - Dependiente en las seis actividades básicas de la vida diaria.";
    } else {
      clasificacion =
        "H - Dependencia en dos actividades pero que no clasifican en C, D, E, y F.";
    }

    Alert.alert(
      "Resultado del Índice de Katz",
      `Resultado: ${independientes}/6\n\nClasificación: ${clasificacion}\n\nPrueba guardada para el paciente: ${nombrePaciente}`,[{
        text: "FINALIZAR",
        onPress: () => finalizarPrueba(independientes,clasificacion)
      }]
    );
    console.log(independientes);
  };

  // Questions map
  const questions: {
    key: keyof KatzAnswers;
    title: string;
    description: string;
  }[] = [
    {
      key: "bath",
      title: "1) Baño (Esponja, regadera o tina).",
      description:
        "Sí: No recibe asistencia (puede entrar y salir de la tina u otra forma de baño).\nSí: Que reciba asistencia durante el baño en una sola parte del cuerpo (ej. espalda o pierna).\nNo: Que reciba asistencia durante el baño en más de una parte.",
    },
    {
      key: "dress",
      title: "2) Vestido.",
      description:
        "Sí: Que pueda tomar las prendas y vestirse completamente, sin asistencia.\nSí: Que pueda tomar las prendas y vestirse sin asistencia excepto en abrocharse los zapatos.\nNo: Que reciba asistencia para tomar las prendas y vestirse.",
    },
    {
      key: "toilet",
      title: "3) Uso del Sanitario.",
      description:
        "Sí: Sin ninguna asistencia (puede utilizar algún objeto de soporte como bastón o silla de ruedas y/o que pueda arreglar su ropa o el uso de pañal).\nSí: Que reciba asistencia al ir al baño, en limpiarse y que pueda manejar por si mismo/a el pañal.\nNo: Que no vaya al baño por si mismo/a.",
    },
    {
      key: "transfer",
      title: "4) Transferencias.",
      description:
        "Sí: Que se mueva dentro y fuera de la cama y silla sin ninguna asistencia (puede estar utilizando un auxiliar de la marcha u objeto de soporte).\nSí: Que pueda moverse dentro y fuera de la cama y silla con asistencia.\nNo: Que no pueda salir de la cama.",
    },
    {
      key: "continence",
      title: "5) Continencia.",
      description:
        "Sí: Control total de esfínteres.\nSí: Que tenga accidentes ocasionales que no afectan su vida social.\nNo: Necesita ayuda para supervisión de control de esfínteres, utiliza sonda o es incontinente.",
    },
    {
      key: "feeding",
      title: "6) Alimentación.",
      description:
        "Sí: Que se alimente por si solo sin asistencia alguna.\nSí: Que se alimente solo y que tenga asistencia sólo para cortar la carne o untar mantequilla.\nNo: Que reciba asistencia en la alimentación o que se alimente parcial o totalmente por vía enteral o parenteral.",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: 8,
          backgroundColor: "#fff",
        }}
      >
        <Text
          style={{
            fontFamily: "Signika_700Bold",
            fontSize: 22,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Indice de Katz
        </Text>

        <Text
          style={{
            fontFamily: "Signika_400Regular",
            fontSize: 16,
            textAlign: "center",
            marginBottom: 5,
            paddingHorizontal: 10,
          }}
        >
          A continuación se evaluarán distintas actividades básicas de la vida
          diaria. Seleccione &quot;Sí&quot; si la persona puede realizar la actividad de
          forma independiente o con asistencia mínima, y &quot;No&quot; si requiere ayuda
          completa o no puede realizarla. En la sección de transferencias puede
          realizar una prueba utilizando los sensores del dispositivo para
          apoyar la evaluación.
        </Text>

        <View
          style={{ height: 1, backgroundColor: "#ccc", marginVertical: 10 }}
        />

        {questions.map((q) => (
          <View key={q.key}>
            <Question
              title={q.title}
              description={q.description}
              value={answers[q.key]}
              onChange={(v) => setAnswers((prev) => ({ ...prev, [q.key]: v }))}
            />

            {q.key === "transfer" && (
              <SensorResultBlock
                onResult={handleSensorResult}
                lastScore={lastSensorScore}
              />
            )}

            <View
              style={{ height: 1, backgroundColor: "#ccc", marginVertical: 15 }}
            />
          </View>
        ))}

        <Pressable
          onPress={calcularKatz}
          style={{
            backgroundColor: "#e1a9ff",
            padding: 15,
            borderRadius: 10,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontFamily: "Signika_700Bold",
              textAlign: "center",
              fontSize: 16,
            }}
          >
            Guardar Prueba
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
