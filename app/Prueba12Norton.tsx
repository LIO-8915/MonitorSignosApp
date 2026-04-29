import { useLocalSearchParams, useRouter } from "expo-router";
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SyncService } from '../services/syncService';

// Interfaz para evitar el error de tipo 'any'
interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

type CriterionKey = 'estadoFisico' | 'estadoMental' | 'actividad' | 'movilidad' | 'incontinencia';

interface Scores {
  estadoFisico: number | null;
  estadoMental: number | null;
  actividad: number | null;
  movilidad: number | null;
  incontinencia: number | null;
}

interface Option {
  value: number;
  label: string;
}

interface Criterion {
  title: string;
  options: Option[];
}

interface Criteria {
  [key: string]: Criterion;
}

export default function NortonScale() {
  const { pacienteId, nombrePaciente } = useLocalSearchParams();
  const finalizarPrueba = async (puntaje: number,diagnostico: string) => {    
    console.log(puntaje);
    if (!pacienteId) {
      Alert.alert("Error", "No hay un paciente vinculado a esta sesión.");
      return;
    }

    try {
      // 3. Guardar en Firebase usando tu SyncService [cite: 2]
      // Nota: Puedes agregar un método 'addResultadoPrueba' en tu syncService.ts similar a 'addPaciente'
      const response = await SyncService.addResultadoPrueba(String(pacienteId), String(nombrePaciente), "Prueba 12 Escala de Norton", puntaje, String(diagnostico)); 
      
      if (response.success) {
        Alert.alert("Éxito", `Prueba guardada para el paciente: ${nombrePaciente}`);
        //router.back(); // Regresar al menú tras finalizar
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo sincronizar con Firebase.");
      console.log(error);
    }
  };
  const router = useRouter();

  const [scores, setScores] = useState<Scores>({
    estadoFisico: null,
    estadoMental: null,
    actividad: null,
    movilidad: null,
    incontinencia: null,
  });

  const [selectedCriterion, setSelectedCriterion] = useState<CriterionKey | null>(null);

  // --- LÓGICA DEL SENSOR (Boca abajo para reiniciar) ---
  useEffect(() => {
    Accelerometer.setUpdateInterval(500);
    const subscription = Accelerometer.addListener((data: AccelerometerData) => {
      // Si Z es menor a -0.9, el teléfono está boca abajo
      if (data.z < -0.9) {
        resetValuesDirectly();
      }
    });
    return () => subscription.remove();
  }, []);

  const resetValuesDirectly = () => {
    setScores({
      estadoFisico: null,
      estadoMental: null,
      actividad: null,
      movilidad: null,
      incontinencia: null,
    });
    setSelectedCriterion(null);
  };

  const criteria: Criteria = {
    estadoFisico: {
      title: 'Estado físico',
      options: [
        { value: 4, label: 'Bueno' },
        { value: 3, label: 'Débil' },
        { value: 2, label: 'Malo' },
        { value: 1, label: 'Muy mala' },
      ],
    },
    estadoMental: {
      title: 'Estado mental',
      options: [
        { value: 4, label: 'Alerta' },
        { value: 3, label: 'Apático' },
        { value: 2, label: 'Confuso' },
        { value: 1, label: 'Estuporoso' },
      ],
    },
    actividad: {
      title: 'Actividad',
      options: [
        { value: 4, label: 'Camina' },
        { value: 3, label: 'Camina con ayuda' },
        { value: 2, label: 'En silla de ruedas' },
        { value: 1, label: 'En cama' },
      ],
    },
    movilidad: {
      title: 'Movilidad',
      options: [
        { value: 4, label: 'Completa' },
        { value: 3, label: 'Limitada ligeramente' },
        { value: 2, label: 'Muy limitada' }
      ],
    },
    incontinencia: {
      title: 'Incontinencia',
      options: [
        { value: 4, label: 'No hay' },
        { value: 3, label: 'Ocasional' },
        { value: 2, label: 'Usualmente urinaria' },
        { value: 1, label: 'Doble incontinencia' },
      ],
    },
  };

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + (score || 0),
    0
  );

  const isComplete = Object.values(scores).every((score) => score !== null);

  const handleScoreSelect = (criterion: CriterionKey, value: number) => {
    setScores((prev) => ({
      ...prev,
      [criterion]: value,
    }));
  };

  const resetEvaluation = () => {
    Alert.alert(
      'Reiniciar evaluación',
      '¿Estás seguro de que quieres reiniciar todos los valores?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', onPress: resetValuesDirectly },
      ]
    );
  };

  const getInterpretation = () => {
    if (!isComplete) return null;
    if (totalScore <= 12) {
      return { level: 'Riesgo alto', color: '#dc3545', description: 'Puntuación ≤ 12 - Requiere intervención inmediata' };
    } else if (totalScore <= 16) {
      return { level: 'Riesgo moderado', color: '#ffc107', description: 'Puntuación ≤ 16 - Requiere medidas preventivas' };
    } else {
      return { level: 'Riesgo bajo', color: '#28a745', description: 'Puntuación > 16 - Mantener cuidados preventivos' };
    }
  };

  const interpretation = getInterpretation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escala de Norton</Text>
        <Text style={styles.subtitle}>Valoración del riesgo de úlceras por presión</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Información:</Text>
          <Text style={styles.infoText}>
            • Puntaje máximo: 20, mínimo: 5{'\n'}
            • Riesgo alto: ≤ 12 puntos | Riesgo moderado: ≤ 16 puntos{'\n'}
            <Text style={{fontWeight: 'bold'}}>• Sensor:</Text> Voltee el celular boca abajo para limpiar datos.
          </Text>
        </View>

        <View style={styles.criteriaContainer}>
          <Text style={styles.sectionTitle}>Criterios de evaluación:</Text>
          {Object.entries(criteria).map(([key, criterion]) => (
            <View key={key} style={styles.criterionCard}>
              <TouchableOpacity
                style={styles.criterionHeader}
                onPress={() => setSelectedCriterion(selectedCriterion === key ? null : key as CriterionKey)}
              >
                <Text style={styles.criterionTitle}>{criterion.title}</Text>
                <View style={styles.criterionRight}>
                  {scores[key as CriterionKey] !== null && (
                    <Text style={styles.criterionScore}>{scores[key as CriterionKey]} pts</Text>
                  )}
                  <Text style={styles.arrow}>{selectedCriterion === key ? '▼' : '▶'}</Text>
                </View>
              </TouchableOpacity>

              {selectedCriterion === key && (
                <View style={styles.optionsContainer}>
                  {criterion.options.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.optionButton, scores[key as CriterionKey] === option.value && styles.selectedOption]}
                      onPress={() => handleScoreSelect(key as CriterionKey, option.value)}
                    >
                      <Text style={styles.optionValue}>{option.value}</Text>
                      <Text style={[styles.optionLabel, scores[key as CriterionKey] === option.value && styles.selectedOptionText]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {isComplete && (
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Resumen de puntuaciones:</Text>
            <View style={styles.table}>
              {Object.entries(criteria).map(([key, criterion]) => (
                <View key={key} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{criterion.title}</Text>
                  <Text style={styles.tableCellValue}>{scores[key as CriterionKey]} pts</Text>
                </View>
              ))}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={styles.tableCellTotal}>TOTAL</Text>
                <Text style={styles.tableCellTotalValue}>{totalScore}/20</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.resultContainer}>
          <Text style={styles.sectionTitle}>Resultado:</Text>
          {!isComplete ? (
            <Text style={styles.incompleteText}>Complete todos los criterios para ver el resultado</Text>
          ) : (
            <View style={styles.resultBox}>
              <View style={[styles.interpretationBox, { backgroundColor: interpretation?.color + '20' }]}>
                <Text style={[styles.interpretationLevel, { color: interpretation?.color }]}>{interpretation?.level}</Text>
                <Text style={styles.interpretationText}>{interpretation?.description}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.checkboxContainer}>
          <Text style={styles.checkboxTitle}>Marque con una ✓ de acuerdo al resultado obtenido:</Text>
          
          <View style={styles.checkboxRow}>
            <View style={[styles.checkbox, totalScore <= 12 && isComplete && styles.checkboxChecked]}>
              {totalScore <= 12 && isComplete && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Riesgo alto: Puntuación ≤ 12</Text>
          </View>

          <View style={styles.checkboxRow}>
            <View style={[styles.checkbox, totalScore > 12 && totalScore <= 16 && isComplete && styles.checkboxChecked]}>
              {totalScore > 12 && totalScore <= 16 && isComplete && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Riesgo moderado: Puntuación ≤ 16</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetEvaluation}>
          <Text style={styles.resetButtonText}>Reiniciar</Text>
        </TouchableOpacity>
        {isComplete && (
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={() => Alert.alert('Éxito', 'Evaluación guardada correctamente')}
          >
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { backgroundColor: '#2c3e50', padding: 20, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: '#3498db' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#ecf0f1', marginTop: 5, textAlign: 'center' },
  content: { flex: 1, padding: 16 },
  infoBox: { backgroundColor: '#e8f4fd', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#b8d9f5' },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#34495e', lineHeight: 22 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15 },
  criteriaContainer: { marginBottom: 20 },
  criterionCard: { backgroundColor: '#ffffff', borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#e0e0e0', overflow: 'hidden' },
  criterionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#ffffff' },
  criterionTitle: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  criterionRight: { flexDirection: 'row', alignItems: 'center' },
  criterionScore: { fontSize: 14, color: '#3498db', fontWeight: 'bold', marginRight: 10 },
  arrow: { fontSize: 16, color: '#7f8c8d' },
  optionsContainer: { padding: 10, backgroundColor: '#f8f9fa', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  optionButton: { flexDirection: 'row', alignItems: 'center', padding: 12, marginVertical: 3, borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#dee2e6' },
  selectedOption: { backgroundColor: '#3498db', borderColor: '#2980b9' },
  optionValue: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', width: 30 },
  optionLabel: { fontSize: 14, color: '#34495e', flex: 1 },
  selectedOptionText: { color: '#ffffff', fontWeight: '500' },
  summaryContainer: { backgroundColor: '#ffffff', borderRadius: 10, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#e0e0e0' },
  table: { marginTop: 10 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  totalRow: { borderBottomWidth: 0, marginTop: 5, paddingTop: 10, borderTopWidth: 2, borderTopColor: '#3498db' },
  tableCell: { fontSize: 14, color: '#34495e' },
  tableCellValue: { fontSize: 14, fontWeight: '600', color: '#2c3e50' },
  tableCellTotal: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  tableCellTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#3498db' },
  resultContainer: { marginBottom: 20 },
  incompleteText: { fontSize: 14, color: '#7f8c8d', fontStyle: 'italic', textAlign: 'center', padding: 20 },
  resultBox: { backgroundColor: '#ffffff', borderRadius: 10, padding: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  interpretationBox: { padding: 15, borderRadius: 8 },
  interpretationLevel: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  interpretationText: { fontSize: 14, color: '#34495e' },
  checkboxContainer: { backgroundColor: '#ffffff', borderRadius: 10, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#e0e0e0' },
  checkboxTitle: { fontSize: 14, color: '#2c3e50', marginBottom: 15, fontWeight: '500' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#3498db', borderRadius: 5, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#3498db' },
  checkmark: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 14, color: '#34495e' },
  footer: { flexDirection: 'row', padding: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  resetButton: { flex: 1, backgroundColor: '#95a5a6', padding: 15, borderRadius: 10, marginRight: 8, alignItems: 'center' },
  resetButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  saveButton: { flex: 1, backgroundColor: '#3498db', padding: 15, borderRadius: 10, marginLeft: 8, alignItems: 'center' },
  saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});