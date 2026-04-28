import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

export const CustomDatePicker: React.FC<DatePickerProps> = ({ label, value, onChange }) => {
  const [show, setShow] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // En Android, la selección cierra el picker automáticamente
    setShow(Platform.OS === 'ios'); 
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  // Función para formatear la fecha a texto (ej: 01 de junio de 1950)
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShow(true)}>
        <Text style={styles.icon}>📅</Text>
        <Text style={styles.dateText}>{formatDate(value)}</Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()} // No permite fechas futuras
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 15, flex: 1 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD', // Borde gris claro como en tu imagen
  },
  icon: { marginRight: 10, fontSize: 16 },
  dateText: { fontSize: 16, color: '#333' },
});