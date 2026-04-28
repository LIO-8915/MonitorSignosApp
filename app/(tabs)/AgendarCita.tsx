import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { child, get, push, ref, set } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllPacientes, Paciente, registrarEnBitacora } from '../../services/database';
import { db } from '../../services/firebase';

export default function AgendarCita() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<any[]>([]);
  
  const [pacienteId, setPacienteId] = useState('');
  const [medicoId, setMedicoId] = useState('');
  const [motivo, setMotivo] = useState('');

  // --- ESTADOS PARA FECHA Y HORA ---
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [fechaTexto, setFechaTexto] = useState('Seleccionar fecha...');
  const [horaTexto, setHoraTexto] = useState('Seleccionar hora...');
  const [fechaValidada, setFechaValidada] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      const listaPacientes = await getAllPacientes();
      setPacientes(listaPacientes);

      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, 'medicos'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        setMedicos(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      }
    };
    cargarDatos();
  }, []);

  // Manejador de Fecha
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setFechaTexto(selectedDate.toLocaleDateString());
      setFechaValidada(true);
    }
  };

  // Manejador de Hora
  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setHoraTexto(`${hours}:${minutes}`);
    }
  };

  const agendarCita = async () => {
    // Validación de campos
    if (!pacienteId || !fechaValidada || horaTexto.includes('Seleccionar')) {
      return Alert.alert("Campos incompletos", "Por favor selecciona un paciente, fecha y hora.");
    }

    const nuevaCitaRef = push(ref(db, 'citas'));
    const nuevaCita = {
      pacienteId,
      medicoId,
      fecha: fechaTexto,
      hora: horaTexto,
      motivo,
      status: 'en curso',
      createdAt: new Date().toISOString()
    };

    try {
      await set(nuevaCitaRef, nuevaCita);
      
      const usuario = await AsyncStorage.getItem('@ultimo_usuario') || 'Médico';
      await registrarEnBitacora({
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        usuario,
        movimiento: 'CITA'
      });

      Alert.alert("Éxito", "Cita agendada correctamente");
      router.back();
    } catch {
      Alert.alert("Error", "No se pudo agendar la cita");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Agendar Nueva Cita</Text>
        
        {/* Paciente */}
        <Text style={styles.label}>Paciente</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={pacienteId} onValueChange={setPacienteId}>
            <Picker.Item label="Seleccionar Paciente..." value="" />
            {pacientes.map(p => <Picker.Item key={p.id} label={`${p.nombre} ${p.apellido}`} value={p.id} />)}
          </Picker>
        </View>

        {/* Médico */}
        <Text style={styles.label}>Médico Responsable</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={medicoId} onValueChange={setMedicoId}>
            <Picker.Item label="Seleccionar Médico..." value="" />
            {medicos.map(m => <Picker.Item key={m.id} label={m.nombre} value={m.id} />)}
          </Picker>
        </View>

        {/* SELECTORES DE FECHA Y HORA */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Fecha</Text>
            <TouchableOpacity style={styles.selectorBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.selectorText}>{fechaTexto}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Hora</Text>
            <TouchableOpacity style={styles.selectorBtn} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.selectorText}>{horaTexto}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()} // No permite citas en el pasado
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={onTimeChange}
          />
        )}

        {/* Motivo */}
        <Text style={styles.label}>Motivo de consulta</Text>
        <TextInput 
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
          placeholder="Escribe el motivo..." 
          multiline 
          value={motivo} 
          onChangeText={setMotivo} 
        />

        <TouchableOpacity style={styles.btnPrimary} onPress={agendarCita}>
          <Text style={styles.btnText}>Confirmar y Guardar</Text>
        </TouchableOpacity>
        
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#F8F9FA' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, color: '#1A1A1A', marginTop: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D1D6', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 16 },
  pickerWrapper: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D1D6', borderRadius: 10, marginBottom: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', marginBottom: 20 },
  selectorBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D1D6', borderRadius: 10, padding: 15, alignItems: 'center' },
  selectorText: { fontSize: 15, color: '#007AFF', fontWeight: '500' },
  btnPrimary: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});