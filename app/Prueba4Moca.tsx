import { FormField } from '@/components/ui/formField';
import { FormSection } from '@/components/ui/formSection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SyncService } from '../services/syncService';

export default function TabTwoScreen() {
  const { pacienteId, nombrePaciente } = useLocalSearchParams();
  const [resultado, setResultado] = useState<number>(0);

  const finalizarPrueba = async () => {
      setResultado(totalScore);
      console.log(resultado);
      if (!pacienteId) {
      Alert.alert("Error", "No hay un paciente vinculado a esta sesión.");
      return;
      }

      // Estructura del objeto a guardar en Firebase
      const datosPrueba = {
      pacienteId: pacienteId,
      nombrePaciente: nombrePaciente,
      tipoPrueba: "Prueba 4 MoCa",
      resultado: resultado, // Aquí va el puntaje o JSON de respuestas
      fecha: new Date().toISOString(),
      };

      try {
      // 3. Guardar en Firebase usando tu SyncService [cite: 2]
      // Nota: Puedes agregar un método 'addResultadoPrueba' en tu syncService.ts similar a 'addPaciente'
      const response = await SyncService.addResultadoPrueba(String(pacienteId), String(nombrePaciente), "Prueba 4 MoCa", resultado); 
      
      if (response.success) {
          Alert.alert("Éxito", `Prueba guardada para el paciente: ${nombrePaciente}`);
          router.replace('/PruebasMenu'); // Regresar al menú tras finalizar
      }
      } catch (error) {
      Alert.alert("Error", "No se pudo sincronizar con Firebase.");
      }
  };

  const [isAccelActive, setIsAccelActive] = React.useState(false);
  const [instruccionActual, setInstruccionActual] = React.useState(0);
  const [tiempoInicio, setTiempoInicio] = React.useState(0);
  const [resultadoEjes, setResultadoEjes] = React.useState('');

  // Estado para los puntos de cada sección
  const [puntos, setPuntos] = React.useState<{ [key: string]: boolean }>({});
  const [puntosResta, setPuntosResta] = React.useState(0);

  // Estado para los datos del paciente
  const [nombre, setNombre] = React.useState('');
  const [edad, setEdad] = React.useState('');
  const [fecha, setFecha] = React.useState('');
  const [sexo, setSexo] = React.useState('');
  const [escolaridad, setEscolaridad] = React.useState('');
  const [savedName, setSavedName] = React.useState('');

  const togglePunto = (id: string) => {
    setPuntos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Cálculo del puntaje total
  const rawScore = Object.entries(puntos).filter(([key, val]) => !key.startsWith('att_calc_') && val).length;
  const escolaridadNum = parseInt(escolaridad) || 0;
  const adjustment = (escolaridadNum >= 12) ? 1 : 0;
  const totalScore = Math.min(30, rawScore + puntosResta + adjustment);

  const getInterpretation = () => {
    if (totalScore >= 26) return { text: 'Se considera normal', color: '#5CB85C' };
    return { text: 'Probable trastorno cognitivo', color: '#D9534F' };
  };

  const interpretation = getInterpretation();

  // Guardar datos del paciente
  const savePatientData = async () => {
    try {
      const data = { nombre, edad, fecha, sexo, escolaridad };
      await AsyncStorage.setItem('patient_data_moca', JSON.stringify(data));
      setSavedName(nombre);
      alert('Datos guardados correctamente');
    } catch (error) {
      console.error('Error al guardar datos:', error);
    }
  };

  // Cargar datos al montar
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('patient_data_moca');
        if (jsonValue != null) {
          const data = JSON.parse(jsonValue);
          setNombre(data.nombre || '');
          setEdad(data.edad || '');
          setFecha(data.fecha || '');
          setSexo(data.sexo || '');
          setEscolaridad(data.escolaridad || '');
          setSavedName(data.nombre || '');
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    loadData();
  }, []);

  React.useEffect(() => {
    let sub: any;
    if (isAccelActive) {
      Accelerometer.setUpdateInterval(200);
      sub = Accelerometer.addListener(data => {
        if (instruccionActual === 1 && data.x > 0.5) { // Inclinado a la izquierda
          setInstruccionActual(2);
        } else if (instruccionActual === 2 && data.x < -0.5) { // Inclinado a la derecha
          setInstruccionActual(3);
        } else if (instruccionActual === 3 && data.z < -0.5) { // Pantalla hacia abajo
          const tiempo = ((Date.now() - tiempoInicio) / 1000).toFixed(1);
          setResultadoEjes(`Prueba completada correctamente en ${tiempo} segundos`);
          setInstruccionActual(4);
          setIsAccelActive(false);
        }
      });
    }
    return () => {
      if (sub) sub.remove();
    };
  }, [isAccelActive, instruccionActual, tiempoInicio]);

  const iniciarPruebaEjes = () => {
    setInstruccionActual(1);
    setTiempoInicio(Date.now());
    setIsAccelActive(true);
    setResultadoEjes('');
  };

  // Componente auxiliar para los switches de puntuación
  const ScoreSwitch = ({ label, id }: { label: string; id: string }) => (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Switch
        value={!!puntos[id]}
        onValueChange={() => togglePunto(id)}
        trackColor={{ false: '#D1D1D1', true: '#005f73' }}
        thumbColor={puntos[id] ? '#FFF' : '#F4F3F4'}
      />
    </View>
  );

  const ScoreOption = ({ label, value }: { label: string; value: number }) => {
    const isSelected = puntosResta === value;
    return (
      <TouchableOpacity
        style={[styles.scoreRow, isSelected && { backgroundColor: '#E7F0FF', borderColor: '#005f73', borderWidth: 1 }]}
        onPress={() => setPuntosResta(isSelected ? 0 : value)}
      >
        <Text style={[styles.scoreLabel, isSelected && { fontWeight: 'bold' }]}>{label}</Text>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <View style={styles.checkboxCheck} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        {/* HEADER */}
        <View style={{ flex: 1, paddingTop: 50 }}>
          <Text style={styles.title}>
            Evaluación MoCA{savedName ? ` - ${savedName}` : ''}
          </Text>
        </View>

        <FormSection title="Datos del paciente" subtitle='Rellene los datos'>
          <View style={{ flex: 1 }}>
            <FormField
              label="Nombre completo:"
              placeholder=''
              value={nombre}
              onChangeText={setNombre}
              multiline={true}
              style={{ height: 80, backgroundColor: '#F1F3F5', color: '#000000', borderRadius: 10, padding: 12, textAlignVertical: 'top' }}
            />

            <FormField
              label="Edad:"
              placeholder=''
              value={edad}
              onChangeText={setEdad}
              keyboardType="numeric"
              style={{ height: 60, backgroundColor: '#F1F3F5', color: '#000000', borderRadius: 10, padding: 12 }}
            />
            <FormField
              label="Fecha:"
              placeholder=''
              value={fecha}
              onChangeText={setFecha}
              style={{ height: 60, backgroundColor: '#F1F3F5', color: '#000000', borderRadius: 10, padding: 12 }}
            />
            <FormField
              label="Sexo:"
              placeholder=''
              value={sexo}
              onChangeText={setSexo}
              style={{ height: 60, backgroundColor: '#F1F3F5', color: '#000000', borderRadius: 10, padding: 12 }}
            />
            <FormField
              label="Años de escolaridad (>= 12 suma 1 punto):"
              placeholder=''
              keyboardType="numeric"
              value={escolaridad}
              onChangeText={setEscolaridad}
              style={{ height: 60, backgroundColor: '#F1F3F5', color: '#000000', borderRadius: 10, padding: 12 }}
            />
            <TouchableOpacity style={styles.btnAction} onPress={savePatientData}>
              <Text style={styles.btnTextAction}>Guardar datos</Text>
            </TouchableOpacity>
          </View>
        </FormSection>

        <FormSection title="Evaluación visuoespacial/ejecutiva" subtitle='Máximo 5 puntos'>
          <View style={{ flex: 1 }}>
            <Text>a. Dibujo de conectar puntos</Text>
            <Text>Se otorga 1 punto en el trazo alternado de números y letras si la línea dibujada por la persona
              evaluada sigue esta secuencia: 1 - A - 2 - B - 3 - C - 4 - D - 5 - E. Se asigna 0 si la persona no
              corrige inmediatamente un error cualquiera que este sea.</Text>
            <ScoreSwitch label="¿Es correcto?" id="visuo_a" />

            <TouchableOpacity style={styles.btnAction} onPress={() => console.log("Dibujo de conectar puntos")}>
              <Text style={styles.btnTextAction}>Subir dibujo</Text>
            </TouchableOpacity>

            <Text>b. Copia del dibujo anterior</Text>
            <Text>Se da 1 punto en el dibujo de copia del cubo es correcto,
              es decir, cumple con todos los siguientes: todas las líneas están
              presentes; no se añaden líneas; las líneas son relativamente paralelas y
              aproximadamente de la misma longitud (se aceptan prismas rectangulares).
              Se asigna 0 si no se han respetado todos los criterios anteriores.</Text>
            <ScoreSwitch label="¿Es correcto?" id="visuo_b" />
            <TouchableOpacity style={styles.btnAction} onPress={() => console.log("Copia del dibujo")}>
              <Text style={styles.btnTextAction}>Subir copia</Text>
            </TouchableOpacity>

            <Text>c. Dibujo de un reloj (10 y 11)</Text>
            <Text>Se asigna 1 punto por cada uno de los criterios siguientes respecto al dibujo del reloj:</Text>
            <ScoreSwitch label="El contorno debe ser un círculo con poca deformación" id="contorno" />
            <ScoreSwitch label="Los números deben estar en el orden correcto y dentro del círculo" id="numeros" />
            <ScoreSwitch label="Las dos manecillas deben indicar la hora correcta; la manecilla de las horas debe ser claramente más pequeña que la manecilla de los minutos. EI punto de unión de las manecillas debe estar cerca del centro del reloj." id="manecillas" />
            <TouchableOpacity style={styles.btnAction} onPress={() => console.log("Subir dibujo del reloj")}>
              <Text style={styles.btnTextAction}>Subir dibujo del reloj</Text>
            </TouchableOpacity>
          </View>
        </FormSection>

        <FormSection title="Evaluación de identificación y nominación" subtitle=''>
          <View style={{ flex: 1 }}>
            <Text>Nombre a los animales:</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <Image
                  source={require('@/assets/images/leon.jpg')}
                  style={{ width: '100%', height: 100, resizeMode: 'contain' }}
                />
                <ScoreSwitch label="León" id="nom_lion" />
              </View>
              <View style={{ flex: 1 }}>
                <Image
                  source={require('@/assets/images/rinoceronte.jpg')}
                  style={{ width: '100%', height: 100, resizeMode: 'contain' }}
                />
                <ScoreSwitch label="Rinoceronte" id="nom_rhino" />
              </View>
              <View style={{ flex: 1 }}>
                <Image
                  source={require('@/assets/images/camello.jpg')}
                  style={{ width: '100%', height: 100, resizeMode: 'contain' }}
                />
                <ScoreSwitch label="Camello" id="nom_camel" />
              </View>
            </View>
          </View>
        </FormSection>

        <FormSection title="Evaluación de atención y concentración" subtitle='Máximo 6 puntos'>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>Secuencias numéricas:</Text>
            <Text>1. Dir: 2-1-8-5-4 | 2. Inv: 2-4-7</Text>
            <ScoreSwitch label="Secuencia directa (2-1-8-5-4)" id="att_dir" />
            <ScoreSwitch label="Secuencia inversa (2-4-7)" id="att_inv" />

            <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Concentración (Letras):</Text>
            <Text>B-Y-S-A-L-A-O... (Golpe en A, max 1 error)</Text>
            <ScoreSwitch label="Serie de letras correcta" id="att_letters" />

            <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Cálculo (Restas de 7):</Text>
            <Text>100-7=93, 86, 79, 72, 65...</Text>
            <ScoreOption label="4 o 5 restas correctas (3 pts)" value={3} />
            <ScoreOption label="2 o 3 restas correctas (2 pts)" value={2} />
            <ScoreOption label="1 resta correcta (1 pt)" value={1} />
            <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>* Seleccione solo la opción alcanzada.</Text>
          </View>
        </FormSection>

        <FormSection title="Evaluación de lenguaje" subtitle='Máximo 3 puntos'>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>Repetición de frases:</Text>
            <Text>1. Solo sé que le toca a Juan ayudar hoy</Text>
            <ScoreSwitch label="Frase 1 correcta" id="lang_rep_1" />
            <Text style={{ marginTop: 5 }}>2. El gato siempre se esconde debajo del sofá...</Text>
            <ScoreSwitch label="Frase 2 correcta" id="lang_rep_2" />

            <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Fluidez:</Text>
            <Text>Diga palabras con la letra F (min 11 en 1 min)</Text>
            <ScoreSwitch label="Fluidez correcta (>= 11 palabras)" id="lang_flu" />
          </View>
        </FormSection>

        <FormSection title="Evaluación de abstracción" subtitle='Máximo 2 puntos'>
          <View style={{ flex: 1 }}>
            <Text>Categorías:</Text>
            <ScoreSwitch label="Tren/Bicicleta (Transporte)" id="abs_trans" />
            <ScoreSwitch label="Reloj/Regla (Medición)" id="abs_meas" />
          </View>
        </FormSection>

        <FormSection title="Evaluación de recuerdo diferido" subtitle='Máximo 5 puntos'>
          <View style={{ flex: 1 }}>
            <Text>Palabras: Rostro, Seda, Iglesia, Clavel, Rojo</Text>
            <ScoreSwitch label="Rostro" id="rec_1" />
            <ScoreSwitch label="Seda" id="rec_2" />
            <ScoreSwitch label="Iglesia" id="rec_3" />
            <ScoreSwitch label="Clavel" id="rec_4" />
            <ScoreSwitch label="Rojo" id="rec_5" />
          </View>
        </FormSection>

        <FormSection title="Evaluación de orientación" subtitle='Máximo 6 puntos'>
          <View style={{ flex: 1 }}>
            <ScoreSwitch label="Fecha exacta" id="ori_date" />
            <ScoreSwitch label="Mes" id="ori_month" />
            <ScoreSwitch label="Año" id="ori_year" />
            <ScoreSwitch label="Día de la semana" id="ori_day" />
            <ScoreSwitch label="Lugar" id="ori_place" />
            <ScoreSwitch label="Localidad" id="ori_loc" />
          </View>
        </FormSection>

        <FormSection title="Comprensión de ejes espaciales" subtitle='Evaluación interactiva'>
          <View style={{ flex: 1, backgroundColor: '#F1F3F5', padding: 15, borderRadius: 10 }}>
            <Text style={{ marginBottom: 10, fontSize: 16 }}>
              Pida al paciente que sostenga el dispositivo y que siga las instrucciones.
            </Text>

            {instruccionActual === 0 && (
              <TouchableOpacity style={styles.btnAction} onPress={iniciarPruebaEjes}>
                <Text style={styles.btnTextAction}>Iniciar Prueba</Text>
              </TouchableOpacity>
            )}

            {instruccionActual === 4 ? (
              <View>
                <Text style={{ fontSize: 18, color: '#5CB85C', fontWeight: 'bold', textAlign: 'center', marginVertical: 10 }}>
                  {resultadoEjes}
                </Text>
                <TouchableOpacity style={styles.btnAction} onPress={iniciarPruebaEjes}>
                  <Text style={styles.btnTextAction}>Reintentar Prueba</Text>
                </TouchableOpacity>
              </View>
            ) : (
              instruccionActual > 0 && (
                <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 }}>
                  Procesando sensores...
                </Text>
              )
            )}
          </View>
        </FormSection>

        <FormSection title="Resultado Final" subtitle='Interpretación oficial MoCA'>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Puntuación Total: {totalScore} / 30</Text>
            {adjustment > 0 && <Text style={styles.adjustmentText}>(Incluye +1 por escolaridad)</Text>}
            <View style={[styles.interpretationBadge, { backgroundColor: interpretation.color }]}>
              <Text style={styles.interpretationText}>{interpretation.text}</Text>
            </View>
          </View>
        </FormSection>

        <FormSection title="Terminar evaluación" subtitle=''>
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.btnSubmit} onPress={() => [console.log("Subir formulario completo", { totalScore, puntos, puntosResta }),
                              finalizarPrueba()]}>
              <Text style={styles.btnTextSubmit}>Subir formulario</Text>
            </TouchableOpacity>
          </View>
        </FormSection>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#001D3D', marginBottom: 20 },
  btnSubmit: { backgroundColor: '#000814', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnTextSubmit: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  btnAction: { backgroundColor: '#005f73', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 10 },
  btnTextAction: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5, backgroundColor: '#F8F9FA', padding: 8, borderRadius: 8 },
  scoreLabel: { fontSize: 14, color: '#333', flex: 1, marginRight: 10 },
  scoreContainer: { alignItems: 'center', padding: 10 },
  scoreText: { fontSize: 26, fontWeight: 'bold', color: '#001D3D' },
  adjustmentText: { fontSize: 14, color: '#666', marginBottom: 10 },
  interpretationBadge: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginTop: 10 },
  interpretationText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#D1D1D1', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  checkboxSelected: { borderColor: '#005f73', backgroundColor: '#005f73' },
  checkboxCheck: { width: 10, height: 10, backgroundColor: '#FFF', borderRadius: 2 },
});
