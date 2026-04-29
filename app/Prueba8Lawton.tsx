import { useLocalSearchParams, useRouter } from "expo-router";
import { Accelerometer } from "expo-sensors";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { SyncService } from '../services/syncService';

export default function Lawton() {
  const { pacienteId, nombrePaciente } = useLocalSearchParams();

  const finalizarPrueba = async (puntaje: number,diagnostico: string) => {
    if(totalRespondidas==5){
      console.log(puntaje);
      if (!pacienteId) {
      Alert.alert("Error", "No hay un paciente vinculado a esta sesión.");
      return;
      }

      try {
      // 3. Guardar en Firebase usando tu SyncService [cite: 2]
      // Nota: Puedes agregar un método 'addResultadoPrueba' en tu syncService.ts similar a 'addPaciente'
      const response = await SyncService.addResultadoPrueba(String(pacienteId), String(nombrePaciente), "Prueba 8 Lawton", puntaje, String(diagnostico)); 
      
      if (response.success) {
          Alert.alert("Éxito", `Prueba guardada para el paciente: ${nombrePaciente}`);
          //router.back(); // Regresar al menú tras finalizar
      }
      } catch (error) {
      Alert.alert("Error", "No se pudo sincronizar con Firebase.");
      }
    }
  };

  const router = useRouter();

  const [resetKey, setResetKey] = useState(0);
  const [telefonoSi, setTelefonoSi] = useState(false);
  const [telefonoNo, setTelefonoNo] = useState(false);
  const [transporteSi, setTransporteSi] = useState(false);
  const [transporteNo, setTransporteNo] = useState(false);
  const [medicacionSi, setMedicacionSi] = useState(false);
  const [medicacionNo, setMedicacionNo] = useState(false);
  const [finanzasSi, setFinanzasSi] = useState(false);
  const [finanzasNo, setFinanzasNo] = useState(false);
  const [comprasSi, setComprasSi] = useState(false);
  const [comprasNo, setComprasNo] = useState(false);

  const shakeStartRef = useRef<number | null>(null);
  const subscriptionRef = useRef<any>(null);

  const puntuacion =
    (telefonoSi ? 1 : 0) +
    (transporteSi ? 1 : 0) +
    (medicacionSi ? 1 : 0) +
    (finanzasSi ? 1 : 0) +
    (comprasSi ? 1 : 0);

  const totalRespondidas =
    (telefonoSi || telefonoNo ? 1 : 0) +
    (transporteSi || transporteNo ? 1 : 0) +
    (medicacionSi || medicacionNo ? 1 : 0) +
    (finanzasSi || finanzasNo ? 1 : 0) +
    (comprasSi || comprasNo ? 1 : 0);

  const todasRespondidas = totalRespondidas === 5;

  const getResultado = () => {
    if (!todasRespondidas) return null;
    if (puntuacion === 5) return { texto: "Independencia total" };
    if (puntuacion >= 4) return { texto: "Dependencia leve" };
    if (puntuacion >= 2) return { texto: "Dependencia moderada" };
    return { texto: "Dependencia severa" };
  };

  const limpiarRespuestas = () => {
    setTelefonoSi(false);
    setTelefonoNo(false);
    setTransporteSi(false);
    setTransporteNo(false);
    setMedicacionSi(false);
    setMedicacionNo(false);
    setFinanzasSi(false);
    setFinanzasNo(false);
    setComprasSi(false);
    setComprasNo(false);
    setResetKey((k) => k + 1);
    shakeStartRef.current = null;
  };

  useEffect(() => {
    Accelerometer.setUpdateInterval(200);

    subscriptionRef.current = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      const moving =
        Math.abs(x) > 1.2 || Math.abs(y) > 1.2 || Math.abs(z) > 1.2;

      if (moving) {
        if (shakeStartRef.current === null) {
          shakeStartRef.current = Date.now();
        } else {
          const elapsed = Date.now() - shakeStartRef.current;
          if (elapsed >= 5000) {
            shakeStartRef.current = null;
            limpiarRespuestas();
            Alert.alert(
              "Campos limpiados",
              "Se detectó movimiento por 5 segundos.",
            );
          }
        }
      } else {
        shakeStartRef.current = null;
      }
    });

    return () => {
      subscriptionRef.current?.remove();
    };
  }, []);

  const resultado = getResultado();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.instrucciones}>
        <Text style={styles.instruccionesTitulo}>Instrucciones</Text>
        <Text style={styles.instruccionesTexto}>
          Evalúe la capacidad del paciente en cada área marcando &quot;Sí&quot; si lo
          realiza de forma independiente o &quot;No&quot; si requiere ayuda o no puede
          hacerlo.------Mueva el dispositivo durante 5 segundos para limpiar las
          respuestas------
        </Text>
      </View>

      <View style={styles.separador} />

      <Text style={styles.titulo}>1) Capacidad para usar teléfono</Text>
      <View style={styles.row}>
        <Text style={styles.parrafo}>
          Sí: Lo opera por iniciativa propia, lo marca sin problemas.{"\n"}
          Sí: Marca sólo unos cuantos números bien conocidos.{"\n"}
          Sí: Contesta el teléfono pero no llama.{"\n"}
          No: No usa el teléfono.
        </Text>
        <View style={styles.checkboxRow}>
          <View style={styles.checkboxItem}>
            <Text>Sí</Text>
            <BouncyCheckbox
              key={`telSi-${resetKey}`}
              isChecked={telefonoSi}
              onPress={() => {
                setTelefonoSi(true);
                setTelefonoNo(false);
              }}
            />
          </View>
          <View style={styles.checkboxItem}>
            <Text>No</Text>
            <BouncyCheckbox
              key={`telNo-${resetKey}`}
              isChecked={telefonoNo}
              onPress={() => {
                setTelefonoSi(false);
                setTelefonoNo(true);
              }}
            />
          </View>
        </View>
      </View>

      <View style={styles.separador} />

      <Text style={styles.titulo}>2) Transporte</Text>
      <View style={styles.row}>
        <Text style={styles.parrafo}>
          Sí: Se transporta solo/a.{"\n"}
          Sí: Se transporta solo/a, únicamente en taxi pero no puede usar otros
          recursos.{"\n"}
          Sí: Viaja en transporte colectivo acompañado.{"\n"}
          No: Viaja en taxi o auto acompañado.{"\n"}
          No: No sale.
        </Text>
        <View style={styles.checkboxRow}>
          <View style={styles.checkboxItem}>
            <Text>Sí</Text>
            <BouncyCheckbox
              key={`transSi-${resetKey}`}
              isChecked={transporteSi}
              onPress={() => {
                setTransporteSi(true);
                setTransporteNo(false);
              }}
            />
          </View>
          <View style={styles.checkboxItem}>
            <Text>No</Text>
            <BouncyCheckbox
              key={`transNo-${resetKey}`}
              isChecked={transporteNo}
              onPress={() => {
                setTransporteSi(false);
                setTransporteNo(true);
              }}
            />
          </View>
        </View>
      </View>

      <View style={styles.separador} />

      <Text style={styles.titulo}>3) Medicación</Text>
      <View style={styles.row}>
        <Text style={styles.parrafo}>
          Sí: Es capaz de tomarla a su hora y dosis correctas.{"\n"}
          Sí: Se hace responsable sólo si le preparan por adelantado.{"\n"}
          No: Es incapaz de hacerse cargo.
        </Text>
        <View style={styles.checkboxRow}>
          <View style={styles.checkboxItem}>
            <Text>Sí</Text>
            <BouncyCheckbox
              key={`medSi-${resetKey}`}
              isChecked={medicacionSi}
              onPress={() => {
                setMedicacionSi(true);
                setMedicacionNo(false);
              }}
            />
          </View>
          <View style={styles.checkboxItem}>
            <Text>No</Text>
            <BouncyCheckbox
              key={`medNo-${resetKey}`}
              isChecked={medicacionNo}
              onPress={() => {
                setMedicacionSi(false);
                setMedicacionNo(true);
              }}
            />
          </View>
        </View>
      </View>

      <View style={styles.separador} />

      <Text style={styles.titulo}>4) Finanzas</Text>
      <View style={styles.row}>
        <Text style={styles.parrafo}>
          Sí: Maneja sus asuntos independientemente.{"\n"}
          No: Sólo puede manejar lo necesario para pequeñas compras.{"\n"}
          No: Es incapaz de manejar dinero.
        </Text>
        <View style={styles.checkboxRow}>
          <View style={styles.checkboxItem}>
            <Text>Sí</Text>
            <BouncyCheckbox
              key={`finSi-${resetKey}`}
              isChecked={finanzasSi}
              onPress={() => {
                setFinanzasSi(true);
                setFinanzasNo(false);
              }}
            />
          </View>
          <View style={styles.checkboxItem}>
            <Text>No</Text>
            <BouncyCheckbox
              key={`finNo-${resetKey}`}
              isChecked={finanzasNo}
              onPress={() => {
                setFinanzasSi(false);
                setFinanzasNo(true);
              }}
            />
          </View>
        </View>
      </View>

      <View style={styles.separador} />

      <Text style={styles.titulo}>5) Compras</Text>
      <View style={styles.row}>
        <Text style={styles.parrafo}>
          Sí: Vigila sus necesidades independientemente.{"\n"}
          Sí: Hace independientemente sólo pequeñas compras.{"\n"}
          No: Necesita compañía para cualquier compra.{"\n"}
          No: Incapaz de cualquier compra.
        </Text>
        <View style={styles.checkboxRow}>
          <View style={styles.checkboxItem}>
            <Text>Sí</Text>
            <BouncyCheckbox
              key={`compSi-${resetKey}`}
              isChecked={comprasSi}
              onPress={() => {
                setComprasSi(true);
                setComprasNo(false);
              }}
            />
          </View>
          <View style={styles.checkboxItem}>
            <Text>No</Text>
            <BouncyCheckbox
              key={`compNo-${resetKey}`}
              isChecked={comprasNo}
              onPress={() => {
                setComprasSi(false);
                setComprasNo(true);
              }}
            />
          </View>
        </View>
      </View>

      <View style={styles.separador} />

      {/* ── PUNTUACIÓN ── */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Puntuación</Text>
        <Text style={styles.scoreValue}>{puntuacion} / 5</Text>
        <Text style={styles.scoreSubtext}>
          {totalRespondidas} de 5 preguntas respondidas
        </Text>
      </View>

      {/* ── RESULTADO (solo si todas respondidas) ── */}
      {resultado && (
        <View style={styles.resultadoContainer}>
          <Text style={styles.resultadoTitulo}>Resultado</Text>
          <Text style={styles.resultadoTexto}>{resultado.texto}</Text>
          <Text style={styles.resultadoDescripcion}>
            {puntuacion === 5 &&
              "El paciente realiza todas las actividades instrumentales de forma autónoma."}
            {puntuacion === 4 &&
              "El paciente presenta dificultad en una actividad instrumental."}
            {puntuacion >= 2 &&
              puntuacion <= 3 &&
              "El paciente presenta dificultades en varias actividades instrumentales y requiere apoyo parcial."}
            {puntuacion <= 1 &&
              "El paciente presenta una dependencia importante en las actividades instrumentales de la vida diaria."}
          </Text>
        </View>
      )}
      <Pressable
        style={({ pressed }) => [
          styles.botonEvaluar,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => finalizarPrueba(puntuacion,String(resultado?.texto))}
      >
        <Text style={styles.textoEvaluar}>Finalizar Evaluacion</Text>
      </Pressable>
      <View style={{ marginBottom: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  botonEvaluar: {
    backgroundColor: "#3B82F6",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  textoEvaluar: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
  instrucciones: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
  },
  instruccionesTitulo: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  instruccionesTexto: {
    fontSize: 14,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  parrafo: {
    fontSize: 16,
    flex: 1,
    flexWrap: "wrap",
  },
  checkboxRow: {
    flexDirection: "row",
    alignSelf: "center",
    marginLeft: 10,
  },
  checkboxItem: {
    alignItems: "center",
    marginLeft: 10,
    width: 40,
  },
  separador: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginVertical: 15,
  },
  scoreContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginVertical: 10,
  },
  scoreLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000",
  },
  scoreSubtext: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },
  resultadoContainer: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
    backgroundColor: "#fff",
  },
  resultadoTitulo: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  resultadoTexto: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 6,
  },
  resultadoDescripcion: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});
