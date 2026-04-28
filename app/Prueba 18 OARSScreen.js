import DateTimePicker from "@react-native-community/datetimepicker";
import { Accelerometer } from "expo-sensors";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Checkbox = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}
  >
    <View
      style={{
        width: 20,
        height: 20,
        borderWidth: 1,
        marginRight: 8,
        backgroundColor: selected ? "#2563eb" : "#fff",
      }}
    />
    <Text>{label}</Text>
  </TouchableOpacity>
);

export default function OARSScreen({
  pacienteActual,
  setPacienteActual,
  setScreen,
}) {
  const initialState = {
    nombre: "",
    edad: "",
    sexo: "",
    fecha: "",
    estadoCivil: "",
    viveEsposo: "",
    viveCon: [],
    personasVive: "",
    visitas: "",
    conocidos: "",
    telefono: "",
    tiempoConOtros: "",
    confianza: "",
    confianzaTexto: "",
    soledad: "",
    frecuenciaFamilia: "",
    ayuda: "",
    tipoCuidado: "",
    cuidadorNombre: "",
    cuidadorRelacion: "",
    convivencia: "",
    evaluador: "",
  };

  const [form, setForm] = useState(initialState);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const shakeTimeout = useRef(null);

  const setField = (key, value) =>
    setForm({ ...form, [key]: value });

  const toggleMulti = (key, value) => {
    const arr = form[key];
    if (arr.includes(value)) {
      setField(
        key,
        arr.filter((v) => v !== value)
      );
    } else {
      setField(key, [...arr, value]);
    }
  };

  const onChangeFecha = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const formatted = selectedDate.toLocaleDateString();
      setField("fecha", formatted);
    }
  };

  // FUNCIÓN PARA LIMPIAR RESPUESTAS
  const limpiarFormulario = () => {
    setForm(initialState);
    Alert.alert("Formulario reiniciado", "Agitaste el teléfono 📱");
  };

  // SENSOR DE SACUDIDA
  useEffect(() => {
    Accelerometer.setUpdateInterval(300);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const totalForce = Math.sqrt(x * x + y * y + z * z);

      if (totalForce > 1.8) {
        if (!shakeTimeout.current) {
          limpiarFormulario();
          shakeTimeout.current = setTimeout(() => {
            shakeTimeout.current = null;
          }, 2000);
        }
      }
    });

    return () => subscription.remove();
  }, []);

  const finalizarPrueba = () => {
    if (!pacienteActual) {
      Alert.alert("Error", "No hay paciente activo");
      return;
    }

    const nuevaPrueba = {
      tipo: "OARS",
      fecha: new Date().toLocaleDateString(),
      detalle: {
        respuestas: form,
      },
    };

    setPacienteActual((prev) => ({
      ...prev,
      pruebas: [...(prev?.pruebas || []), nuevaPrueba],
    }));

    Alert.alert(
      "Prueba Guardada",
      "El formulario OARS fue guardado correctamente."
    );

    setScreen("Agendar Cita");
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>
        Formulario OARS
      </Text>

      


      {/* Datos básicos */}
      <Text>Nombre:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(v) => setField("nombre", v)}
      />

      <Text>Edad:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        onChangeText={(v) => setField("edad", v)}
      />

      {/* SEXO */}
      <Text>Sexo:</Text>
      <Checkbox
        label="Hombre"
        selected={form.sexo === "Hombre"}
        onPress={() => setField("sexo", "Hombre")}
      />
      <Checkbox
        label="Mujer"
        selected={form.sexo === "Mujer"}
        onPress={() => setField("sexo", "Mujer")}
      />

      {/* FECHA */}
      <Text>Fecha:</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{form.fecha || "Seleccionar fecha"}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={form.fecha ? new Date(form.fecha) : new Date()}
          mode="date"
          display="default"
          onChange={onChangeFecha}
          maximumDate={new Date()}
        />
      )}

      {/* 1 */}
      <Text style={styles.q}>1. ¿Su estado civil es?</Text>
      {[
        "Soltero(a)",
        "Casado(a) o Unión Libre",
        "Viudo(a)",
        "Divorciado(a)",
        "Separado(a)",
      ].map((op) => (
        <Checkbox
          key={op}
          label={op}
          selected={form.estadoCivil === op}
          onPress={() => setField("estadoCivil", op)}
        />
      ))}

      {/* 2 */}
      {form.estadoCivil === "Casado(a) o Unión Libre" && (
        <>
          <Text style={styles.q}>
            2. ¿Vive su esposo(a)?
          </Text>
          {["No", "Sí"].map((op) => (
            <Checkbox
              key={op}
              label={op}
              selected={form.viveEsposo === op}
              onPress={() => setField("viveEsposo", op)}
            />
          ))}
        </>
      )}

      {/* 3 */}
      <Text style={styles.q}>
        3. ¿Con quién vive usted?
      </Text>
      {[
        "Nadie",
        "Esposo(a)",
        "Hijos(as)",
        "Nietos(as)",
        "Padres",
        "Hermanos(as)",
        "Otros familiares",
        "Amigos(as)",
        "Cuidadores pagados",
        "Otros",
      ].map((op) => (
        <Checkbox
          key={op}
          label={op}
          selected={form.viveCon.includes(op)}
          onPress={() => toggleMulti("viveCon", op)}
        />
      ))}

      {/* 4 */}
      <Text style={styles.q}>
        4. ¿Con cuántas personas vive?
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        onChangeText={(v) =>
          setField("personasVive", v)
        }
      />

      {/* 5 */}
      <Text style={styles.q}>
        5. ¿Cuántas veces visitó a familia/amigos?
      </Text>
      {[
        "Nunca",
        "Cada seis meses",
        "Cada tres meses",
        "Cada mes",
        "Menos de una vez al mes",
        "Menos de una vez a la semana",
        "1-3 veces a la semana",
        "Más de cuatro veces a la semana",
      ].map((op) => (
        <Checkbox
          key={op}
          label={op}
          selected={form.visitas === op}
          onPress={() => setField("visitas", op)}
        />
      ))}

      {/* 6 */}
      <Text style={styles.q}>
        6. ¿A cuántas personas conoce para visitar?
      </Text>
      {[
        "Ninguna",
        "Una o dos",
        "Tres a cuatro",
        "Cinco o más",
      ].map((op) => (
        <Checkbox
          key={op}
          label={op}
          selected={form.conocidos === op}
          onPress={() => setField("conocidos", op)}
        />
      ))}

      {/* 7 */}
      <Text style={styles.q}>
        7. ¿Cuántas veces habló por teléfono?
      </Text>
      {[
        "Ninguna",
        "Una vez a la semana",
        "Dos a seis veces",
        "Más de seis veces",
        "Una vez al día",
      ].map((op) => (
        <Checkbox
          key={op}
          label={op}
          selected={form.telefono === op}
          onPress={() => setField("telefono", op)}
        />
      ))}

      {/* 8 */}
      <Text style={styles.q}>
        8. ¿Cuántas veces pasó tiempo con alguien?
      </Text>
      {[
        "Ninguna",
        "Una vez",
        "2-6 veces",
        "Más de seis veces",
      ].map((op) => (
        <Checkbox
          key={op}
          label={op}
          selected={form.tiempoConOtros === op}
          onPress={() =>
            setField("tiempoConOtros", op)
          }
        />
      ))}

      {/* 9 */}
      <Text style={styles.q}>
        9. ¿Tiene alguien en quien confiar?
      </Text>
      {["No", "Sí"].map((op) => (
        <Checkbox
          key={op}
          label={op}
          selected={form.confianza === op}
          onPress={() => setField("confianza", op)}
        />
      ))}

      {form.confianza === "Sí" && (
        <TextInput
          style={styles.input}
          placeholder="Especifique"
          onChangeText={(v) =>
            setField("confianzaTexto", v)
          }
        />
      )}

      {/* 10 */}
      <Text style={styles.q}>
        10. ¿Se siente solo(a)?
      </Text>
      {[
        "Casi nunca",
        "Algunas veces",
        "A menudo",
      ].map((op) => (
        <Checkbox
          key={op}
          label={op}
          selected={form.soledad === op}
          onPress={() => setField("soledad", op)}
        />
      ))}

      {/* 11 */}
      <Text style={styles.q}>
        11. ¿Ve a sus familiares como quisiera?
      </Text>
      {[
        "Algo triste por la poca frecuencia",
        "Tan a menudo como quisiera",
      ].map((op) => (
        <Checkbox
          key={op}
          label={op}
          selected={
            form.frecuenciaFamilia === op
          }
          onPress={() =>
            setField("frecuenciaFamilia", op)
          }
        />
      ))}

      {/* 12 */}
      <Text style={styles.q}>
        12. ¿Tendría quien le ayudara?
      </Text>
      {["No", "Sí"].map((op) => (
        <Checkbox
          key={op}
          label={op}
          selected={form.ayuda === op}
          onPress={() => setField("ayuda", op)}
        />
      ))}

      {form.ayuda === "Sí" && (
        <>
          <Text style={styles.q}>
            A) ¿Esa persona cuidaría de usted?
          </Text>
          {[
            "Forma pasajera",
            "Corto periodo",
            "Indefinida",
          ].map((op) => (
            <Checkbox
              key={op}
              label={op}
              selected={
                form.tipoCuidado === op
              }
              onPress={() =>
                setField("tipoCuidado", op)
              }
            />
          ))}

          <Text style={styles.q}>
            B) ¿Quién sería esa persona?
          </Text>

          <Text>Nombre:</Text>
          <TextInput
            style={styles.input}
            onChangeText={(v) =>
              setField("cuidadorNombre", v)
            }
          />

          <Text>Relación:</Text>
          <TextInput
            style={styles.input}
            onChangeText={(v) =>
              setField(
                "cuidadorRelacion",
                v
              )
            }
          />
        </>
      )}

      {/* 13 */}
      <Text style={styles.q}>
        13. ¿Cómo considera la convivencia?
      </Text>
      {[
        "Muy insatisfactoria",
        "Insatisfactoria",
        "Muy satisfactoria",
        "Satisfactoria",
      ].map((op) => (
        <Checkbox
          key={op}
          label={op}
          selected={form.convivencia === op}
          onPress={() =>
            setField("convivencia", op)
          }
        />
      ))}

      <Text style={styles.q}>Evaluador:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(v) =>
          setField("evaluador", v)
        }
      />
      <View style={{ height: 30 }} />

      <Button
        title="Finalizar y Guardar OARS"
        onPress={finalizarPrueba}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  q: {
    marginTop: 14,
    fontWeight: "bold",
  },
};