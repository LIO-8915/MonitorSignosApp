import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  DrawerLayoutAndroid,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Option {
  id: string;
  label: string;
  value: number;
}

interface Question {
  id: string;
  question: string;
  options: Option[];
}

const quizData: Question[] = [
  {
    id: 'p1',
    question: '1. ¿Ha comido menos por falta de apetito, problemas digestivos, dificultades de masticación o deglución en los últimos 3 meses?',
    options: [
      { id: '1a', label: 'Ha comido mucho menos', value: 0 },
      { id: '1b', label: 'Ha comido menos', value: 1 },
      { id: '1c', label: 'Igual o mucho más', value: 2 },
    ],
  },
  {
    id: 'p2',
    question: '2. ¿Ha tenido pérdida reciente de peso en los últimos tres meses?',
    options: [
      { id: '2a', label: 'Pérdida mayor a 3 kilos', value: 0 },
      { id: '2b', label: 'No lo sabe', value: 1 },
      { id: '2c', label: 'Pérdida de peso entre 1 y 3 kilos', value: 2 },
      { id: '2d', label: 'No ha perdido peso', value: 3 },
    ],
  },
  {
    id: 'p3',
    question: '3. Movilidad (¿Cómo se desplaza habitualmente?)',
    options: [
      { id: '3a', label: 'De la cama al sillón', value: 0 },
      { id: '3b', label: 'Autonomía en el interior del domicilio', value: 1 },
      { id: '3c', label: 'Sale del domicilio / Sale a la calle', value: 2 },
    ],
  },
  {
    id: 'p4',
    question: '4. ¿Ha tenido una enfermedad aguda o estrés psicológico en los últimos tres meses?',
    options: [
      { id: '4a', label: 'Sí', value: 0 },
      { id: '4b', label: 'No', value: 2 },
    ],
  },
  {
    id: 'p5',
    question: '5. Problemas neuropsicológicos:',
    options: [
      { id: '5a', label: 'Demencia o depresión grave', value: 0 },
      { id: '5b', label: 'Demencia moderada', value: 1 },
      { id: '5c', label: 'Sin problemas psicológicos', value: 2 },
    ],
  },
  {
    id: 'p6',
    question: '6. Índice de Masa Corporal (IMC):',
    options: [
      { id: '6a', label: 'Menor a 19', value: 0 },
      { id: '6b', label: 'Entre 19 y menos de 21', value: 1 },
      { id: '6c', label: 'Entre 21 y menos de 23', value: 2 },
      { id: '6d', label: 'Mayor o igual a 23', value: 3 },
    ],
  },
];

const QuizApp = () => {
  //Estado para controlar qué pantalla se ve
  const [pantallaActiva, setPantallaActiva] = useState('MNA');
  const drawer = useRef<DrawerLayoutAndroid>(null);

  const navigationView = (
    <View style={styles.drawerContainer}>
      <Text style={styles.drawerTitle}>Menú Lateral</Text>
      <Button
        title="Cerrar menú lateral"
        onPress={() => drawer.current?.closeDrawer()} 
      />
      {/* Botón para la pantalla del MNA */}
      <TouchableOpacity 
        style={{ padding: 15, backgroundColor: pantallaActiva === 'MNA' ? '#E8F0FE' : '#FFF', marginBottom: 10 }}
        onPress={() => {
          setPantallaActiva('15 MNA-SF.tsx');
          drawer.current?.closeDrawer(); // Cierra el menú al tocar
        }}>
        <Text style={{ fontSize: 16, color: pantallaActiva === 'MNA' ? '#1967D2' : '#333' }}>📋 Evaluación MNA</Text>
      </TouchableOpacity>

      {/* Botón para la pantalla de Registro de Personal */}
      <TouchableOpacity 
        style={{ padding: 15, backgroundColor: pantallaActiva === 'Registro' ? '#E8F0FE' : '#FFF', marginBottom: 10 }}
        onPress={() => {
          setPantallaActiva('RegistroPersonalMedico.tsx');
          drawer.current?.closeDrawer();
        }}>
        <Text style={{ fontSize: 16, color: pantallaActiva === 'Registro' ? '#1967D2' : '#333' }}>👨‍⚕️ Registro Médico</Text>
      </TouchableOpacity>
    </View>
  );

  // Estados del cuestionario MNA
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [peso, setPeso] = useState('');
  const [estatura, setEstatura] = useState('');

  // Estados de sensores
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const [magData, setMagData] = useState({ x: 0, y: 0, z: 0 });

  // Candado para alertas del acelerómetro
  const isAlertVisible = useRef(false);
  const [nivelPerturbacion, setNivelPerturbacion] = useState(0);
  const [alertaRoja, setAlertaRoja] = useState(false);
  const historialMovimiento = useRef<number[]>([]);

  // Lógica del IMC
  const imcCalculado = useMemo(() => {
    const p = parseFloat(peso);
    const e = parseFloat(estatura);
    if (p > 0 && e > 0) return (p / (e * e)).toFixed(2);
    return null;
  }, [peso, estatura]);

  // Manejo de sensores
  useEffect(() => {
    // 1. ACELERÓMETRO: Detectar sacudida para reiniciar el test
    const accSub = Accelerometer.addListener(data => {
      // 1. Calcular la fuerza G total (Teorema de Pitágoras en 3D)
      const gForce = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      
      // Restamos 1.0 (que es la gravedad terrestre estática) para obtener el movimiento real
      let movimientoReal = Math.abs(gForce - 1.0);

      // 2. Tolerancia del 6% (0.06 Gs). Movimientos menores a esto se ignoran (se vuelven 0).
      if (movimientoReal < 0.11) {
        movimientoReal = 0;
      }

      // 3. Añadir a la cola y calcular la media
      historialMovimiento.current.push(movimientoReal);
      const suma = historialMovimiento.current.reduce((a, b) => a + b, 0);
      const media = suma / historialMovimiento.current.length;
      
      setNivelPerturbacion(media);

      if (media > 0.55) {
        // Si la perturbación promedio supera el 0.7, preguntamos si quiere limpiar
        handleConfirmarReinicio();
      }

      // 4. Si la media sostenida supera 0.15, consideramos perturbación constante (mediana/fuerte)
      if (media > 0.15) {
        setAlertaRoja(true);
      } else {
        setAlertaRoja(false); // Vuelve a la normalidad si la media desciende
      }
    });

    // 5. Limpiar la media y el historial cada 5 segundos
    const intervaloLimpieza = setInterval(() => {
      historialMovimiento.current = [];
      setNivelPerturbacion(0);
      setAlertaRoja(false);
    }, 5000);

    // 2. GIROSCOPIO y 3. MAGNETÓMETRO
    const gyroSub = Gyroscope.addListener(data => setGyroData(data));
    Gyroscope.setUpdateInterval(100);
    Magnetometer.setUpdateInterval(100);
    const magSub = Magnetometer.addListener(data => {
      setMagData(data);
    });

    return () => {
      accSub.remove();
      clearInterval(intervaloLimpieza);
      gyroSub.remove();
      magSub.remove();
    };
  }, []);

  let heading = 0;
  if (magData) {
    let { x, y } = magData;
    heading = Math.atan2(x, y) * (180 / Math.PI);
    if (heading < 0) {
      heading += 360;
    }
  }

  const anguloMostrar = Math.round(heading);

  const getDireccionCardinal = (anguloMostrar: number) => {
    if (anguloMostrar >= 337.5 || anguloMostrar < 22.5) return 'Norte (N)';
    if (anguloMostrar >= 22.5 && anguloMostrar < 67.5) return 'Noreste (NE)';
    if (anguloMostrar >= 67.5 && anguloMostrar < 112.5) return 'Este (E)';
    if (anguloMostrar >= 112.5 && anguloMostrar < 157.5) return 'Sureste (SE)';
    if (anguloMostrar >= 157.5 && anguloMostrar < 202.5) return 'Sur (S)';
    if (anguloMostrar >= 202.5 && anguloMostrar < 247.5) return 'Suroeste (SO)';
    if (anguloMostrar >= 247.5 && anguloMostrar < 292.5) return 'Oeste (O)';
    if (anguloMostrar >= 292.5 && anguloMostrar < 337.5) return 'Noroeste (NO)';
    return '';
  };

  const rumboCardinal = getDireccionCardinal(anguloMostrar);

  const handleConfirmarReinicio = () => {
    if (isAlertVisible.current) return;
    isAlertVisible.current = true;

    Alert.alert(
      "Reinicio rápido detectado",
      "¿Deseas borrar todas las respuestas y el IMC actual?",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => { isAlertVisible.current = false; } 
        },
        {
          text: "Sí, reiniciar test",
          style: "destructive",
          onPress: () => {
            setAnswers({});
            setPeso('');
            setEstatura('');
            isAlertVisible.current = false; 
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const calculateTotal = () => {
    let total = 0;
    Object.keys(answers).forEach((qId) => {
      const question = quizData.find((q) => q.id === qId);
      const option = question?.options.find((o) => o.id === answers[qId]);
      if (option) total += option.value;
    });

    let diagnostico = total >= 12 ? "Estado nutricional normal" : total >= 8 ? "Riesgo de malnutrición" : "Malnutrición";
    Alert.alert("Resultado MNA", `Puntaje: ${total} pts.\n${diagnostico}`);
  };

  const isFinished = Object.keys(answers).length === quizData.length;

  return (
    <DrawerLayoutAndroid
      ref={drawer}
      drawerWidth={280}
      drawerPosition="left"
      renderNavigationView={() => navigationView}>

      <SafeAreaView style={styles.container}>
        <StatusBar hidden={true} />

        <View style={[styles.header, { flexDirection: 'row', alignItems: 'center' }]}>
          <TouchableOpacity 
            onPress={() => drawer.current?.openDrawer()} 
            style={{ marginRight: 15 }}
          >
            <Text style={{ fontSize: 26, color: '#007AFF' }}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Evaluación MNA Pro</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* SECCIÓN DE SENSORES */}
          <View style={styles.sensorCard}>
            <Text style={styles.sensorTitle}>🩺 Sensores Activos</Text>
            
            <View style={styles.sensorRow}>
              <View style={[styles.sensorBox, alertaRoja && styles.sensorBoxDanger]}>
                <Text style={[styles.sensorLabel, alertaRoja && styles.textDanger]}>Perturbación</Text>
                {/* Multiplicamos por 100 para mostrarlo como porcentaje de intensidad */}
                <Text style={[styles.sensorValue, alertaRoja && styles.textDanger]}>
                  Intensidad: {(nivelPerturbacion * 100).toFixed(1)}%
                </Text>
                <Text style={styles.sensorSub}>
                  {alertaRoja ? '¡Movimiento Constante!' : 'Estable'}
                </Text>
              </View>
              
              <View style={styles.sensorBox}>
                <Text style={styles.sensorLabel}>Brújula (Orientación)</Text>
                <Text style={styles.sensorValue}>{anguloMostrar}° {rumboCardinal}</Text>
                <Text style={styles.sensorSub}>Rumbo actual</Text>
              </View>
            </View>
            <Text style={styles.hint}>💡 Agita el teléfono para reiniciar el test</Text>
          </View>

          {/* CUESTIONARIO MNA */}
          {quizData.map((item, index) => (
            <View key={item.id}>        
              
              {/* CALCULADORA IMC ANTES DE LA PREGUNTA 6 */}
              {index === 5 && (
                <View style={styles.imcCalculatorCard}>
                  <Text style={styles.imcTitle}>Calcular el IMC</Text>
                  <View style={styles.row}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.labelInput}>Peso (kg)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Ej: 70"
                        keyboardType="numeric"
                        value={peso}
                        onChangeText={setPeso}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.labelInput}>Estatura (m)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Ej: 1.75"
                        keyboardType="numeric"
                        value={estatura}
                        onChangeText={setEstatura}
                      />
                    </View>
                  </View>
                  {imcCalculado && (
                    <View style={styles.resultBadge}>
                      <Text style={styles.resultText}>IMC Resultado: {imcCalculado}</Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.questionCard}>
                <Text style={styles.questionText}>{item.question}</Text>
                <View style={styles.optionsContainer}>
                  {item.options.map((option) => {
                    const isSelected = answers[item.id] === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        onPress={() => handleSelect(item.id, option.id)}
                        style={[styles.optionButton, isSelected && styles.optionSelected]}
                      >
                        <Text style={[styles.optionLabel, isSelected && styles.textSelected]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.submitBtn, !isFinished && styles.submitBtnDisabled]}
            onPress={calculateTotal}
            disabled={!isFinished}
          >
            <Text style={styles.submitBtnText}>Ver Resultado Final</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
     </DrawerLayoutAndroid>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7'},
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#CCC' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E' },
  scrollContent: { padding: 16 },
  drawerContainer: { flex: 1, backgroundColor: '#f0f0f0', padding: 16 },
  drawerTitle: { fontSize: 20, marginBottom: 20 },
  text: { fontSize: 18, marginBottom: 10 },
  
  // Estilos de Tarjeta de Sensores (Integrados del segundo código)
  sensorCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 3, borderWidth: 1, borderColor: '#E5E5EA' },
  sensorTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  sensorRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sensorBox: { width: '48%', backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  sensorLabel: { fontSize: 12, color: '#7f8c8d', fontWeight: '600' },
  sensorValue: { fontSize: 15, color: '#2980b9', fontWeight: 'bold' },
  sensorSub: { fontSize: 10, color: '#95a5a6' },
  hint: { fontSize: 11, color: '#e67e22', marginTop: 10, fontStyle: 'italic', textAlign: 'center' },
  sensorBoxDanger: {
    borderColor: '#ff4d4d',
    backgroundColor: '#ffe6e6',
  },
  textDanger: {
    color: '#cc0000',
  },

  // Estilos del MNA (Originales del primer código)
  questionCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 20 },
  questionText: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  optionsContainer: { gap: 8 },
  optionButton: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#E5E5EA' },
  optionSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  optionLabel: { fontSize: 15 },
  textSelected: { color: '#FFF', fontWeight: 'bold' },
  
  // Estilos de la Calculadora IMC
  imcCalculatorCard: {
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BDD7FF',
  },
  imcTitle: { fontSize: 16, fontWeight: 'bold', color: '#1967D2', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputGroup: { width: '45%' },
  labelInput: { fontSize: 12, color: '#5F6368', marginBottom: 4 },
  input: { backgroundColor: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DADCE0' },
  resultBadge: { marginTop: 12, backgroundColor: '#1967D2', padding: 8, borderRadius: 6, alignItems: 'center' },
  resultText: { color: '#FFF', fontWeight: 'bold' },
  
  submitBtn: { backgroundColor: '#34C759', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
  submitBtnDisabled: { backgroundColor: '#A2A2A2' },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default QuizApp;