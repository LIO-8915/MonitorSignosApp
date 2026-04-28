import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

interface Props {
  label: string;
  data: { label: string; value: string }[];
  placeholder: string;
  value: string | null;
  onChange: (item: any) => void;
}

export const FormDropdown = ({ label, data, placeholder, value, onChange }: Props) => {
  return (
    <View style={styles.container}>
      {/* Esto es lo que faltaba: la etiqueta arriba del dropdown */}
      <Text style={styles.label}>{label}</Text>
      
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        data={data}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onChange={item => onChange(item.value)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Permite que se alinee con el CURP en la misma fila
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5, // Espacio entre el texto y el cuadro
    color: '#333',
  },
  dropdown: {
    height: 40, // Altura fina para que no se vea tosco
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: 'transparent', // Sin borde para que se vea limpio como el CURP
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#333',
  },
});