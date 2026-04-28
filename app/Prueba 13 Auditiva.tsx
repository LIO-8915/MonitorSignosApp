import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const PruebaSusurro = () => {
  const [combDerecho, setCombDerecho] = useState('');
  const [combIzquierdo, setCombIzquierdo] = useState('');
  // const [resultadoDerecho, setResultadoDerecho] = useState(null);
  // const [resultadoIzquierdo, setResultadoIzquierdo] = useState(null);
  const [resultadoDerecho, setResultadoDerecho] = useState<boolean | null>(null);
  const [resultadoIzquierdo, setResultadoIzquierdo] = useState<boolean | null>(null);

  const generarCombinacion = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let resultado = [];
    for (let i = 0; i < 3; i++) {
      const randomIndice = Math.floor(Math.random() * caracteres.length);
      resultado.push(caracteres.charAt(randomIndice));
    }
    return resultado.join('-'); 
  };

  useEffect(() => {
    setCombDerecho(generarCombinacion());
    setCombIzquierdo(generarCombinacion());
  }, []);

  useEffect(() => {
    const subscription = Accelerometer.addListener(data => {
      const totalForce = Math.abs(data.x) + Math.abs(data.y) + Math.abs(data.z);
      if (totalForce > 2.5) {
        if (resultadoDerecho === null) setCombDerecho(generarCombinacion());
        if (resultadoIzquierdo === null) setCombIzquierdo(generarCombinacion());
      }
    });
    Accelerometer.setUpdateInterval(100);
    return () => subscription.remove();
  }, [resultadoDerecho, resultadoIzquierdo]);

  const finalizarPrueba = () => {
    if (resultadoDerecho === null || resultadoIzquierdo === null) {
      Alert.alert("Atención", "Debes evaluar ambos oídos antes de guardar.");
      return;
    }

    let diagnostico = "";
    if (!resultadoDerecho && !resultadoIzquierdo) {
      diagnostico = "Falla detectada en ambos oídos.";
    } else if (!resultadoDerecho) {
      diagnostico = "Falla detectada en el Oído Derecho.";
    } else if (!resultadoIzquierdo) {
      diagnostico = "Falla detectada en el Oído Izquierdo.";
    } else {
      diagnostico = "Audición normal en ambos oídos.";
    }

    Alert.alert(
      "Resultado de la Evaluación", 
      diagnostico,
      [
        {
          text: "OK",
          onPress: () => {
            setResultadoDerecho(null);
            setResultadoIzquierdo(null);
            setCombDerecho(generarCombinacion());
            setCombIzquierdo(generarCombinacion());
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />
      <ScrollView style={styles.formContainer}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Prueba del Susurro</Text>
          <Text style={styles.subtitle}>Agudeza Auditiva</Text>
        </View>

        <View>
          <Text style={styles.seccionIndicaciones}>Indicaciones</Text>
          <View style={styles.indicaciones}>
            <Text>Avisele al paciente que iniciará la evaluación auditiva.</Text>
            <Text>-Póngase detrás del paciente.</Text>
            <Text>-Tome una distancia de 1m.</Text>
            <Text>-Susurre los primeros caracteres.</Text>
            <Text>-Presione la opción correcta en el botón si acertó o no.</Text>
            <Text>-Al no acertar con un susurro, agite el teléfono y cambiarán las letras.</Text>
            <Text>-Al finalizar la prueba presione el botón GUARDAR.</Text>
          </View>
          
        </View>

        {/* Evaluación Oído Derecho */}
        <View style={styles.evaluacionSection}>
          <Text style={styles.sectionTitle}>Evaluación Oído Derecho</Text>
          <View style={styles.generadorContainer}>
            <Text style={styles.combinacionTexto}>{combDerecho}</Text>
          </View>
          <View style={styles.botonesResultado}>
            <TouchableOpacity 
              style={[styles.btnPasa, resultadoDerecho === true && styles.btnPasaActivo]}
              onPress={() => setResultadoDerecho(true)}>
              <Text style={[styles.btnResTexto, resultadoDerecho === true && styles.textoBlanco]}>Sí logró</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btnFalla, resultadoDerecho === false && styles.btnFallaActivo]}
              onPress={() => setResultadoDerecho(false)}>
              <Text style={[styles.btnResTexto, resultadoDerecho === false && styles.textoBlanco]}>No logró</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Evaluación Oído Izquierdo */}
        <View style={styles.evaluacionSection}>
          <Text style={styles.sectionTitle}>Evaluación Oído Izquierdo</Text>
          <View style={styles.generadorContainer}>
            <Text style={styles.combinacionTexto}>{combIzquierdo}</Text>
          </View>
          <View style={styles.botonesResultado}>
            <TouchableOpacity 
              style={[styles.btnPasa, resultadoIzquierdo === true && styles.btnPasaActivo]}
              onPress={() => setResultadoIzquierdo(true)}>
              <Text style={[styles.btnResTexto, resultadoIzquierdo === true && styles.textoBlanco]}>Sí logró</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btnFalla, resultadoIzquierdo === false && styles.btnFallaActivo]}
              onPress={() => setResultadoIzquierdo(false)}>
              <Text style={[styles.btnResTexto, resultadoIzquierdo === false && styles.textoBlanco]}>No logró</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.btnGuardar} onPress={finalizarPrueba}>
          <Text style={styles.btnGuardarTexto}>GUARDAR PRUEBA</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  seccionIndicaciones:{
    backgroundColor: '#1101',
    color: '#6A0dad', 
  },
  indicaciones:{
    backgroundColor: 'rgba(187, 187, 178, 0.03)',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#fafafa' 
  },
  formContainer: { 
    paddingHorizontal: 20, 
    paddingTop: 10 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 20 
  },
  title: {
    paddingTop: 30,
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  subtitle: { 
    fontSize: 18, 
    color: '#00A8E8' 
  },
  evaluacionSection: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#eee' 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#6A0dad', 
    textAlign: 'center', 
    marginBottom: 15 
  },
  generadorContainer: { 
    backgroundColor: '#f5f5f5', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 15,
    alignItems: 'center' 
  },
  combinacionTexto: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    letterSpacing: 3 
  },
  botonesResultado: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  btnPasa: { 
    flex: 1, 
    backgroundColor: '#f0f0f0', 
    padding: 12, 
    borderRadius: 8, 
    marginRight: 5, 
    alignItems: 'center' 
  },
  btnFalla: { 
    flex: 1, 
    backgroundColor: '#f0f0f0', 
    padding: 12, 
    borderRadius: 8, 
    marginLeft: 5, 
    alignItems: 'center' 
  },
  btnPasaActivo: { 
    backgroundColor: '#4CAF50' 
  },
  btnFallaActivo: { 
    backgroundColor: '#F44336' 
  },
  btnResTexto: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#666' 
  },
  textoBlanco: { 
    color: '#fff' 
  },
  btnGuardar: { 
    backgroundColor: '#6A0dad', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 40 
  },
  btnGuardarTexto: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});

export default PruebaSusurro;