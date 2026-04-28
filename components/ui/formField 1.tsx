import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from 'react-native';
import { FormFieldProps } from '../../.expo/types/formFieldTypes';

export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  placeholder, 
  error, 
  style, 
  ...props 
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  return (
    <View style={styles.container}> 
      <Text style={styles.label}>{label}</Text>
      <TextInput 
        style={[
          styles.input, 
          { fontSize: isMobile ? 14 : 15 },
          error ? styles.inputError : null,
          style
        ]} 
        placeholder={placeholder}
        placeholderTextColor="#999"
        {...(Platform.OS === 'android' ? { includeFontPadding: false } : {})}
        {...props} 
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 15, flex: 1 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#000' },
  input: {
    height: 40,
    backgroundColor: '#F1F3F5',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  inputError: { borderColor: '#FF4D4D', backgroundColor: '#FFF5F5' },
  errorText: { color: '#FF4D4D', fontSize: 11, marginTop: 5, fontWeight: '500' },
});