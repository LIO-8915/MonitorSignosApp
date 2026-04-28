import { TextInputProps, TextStyle, ViewStyle } from 'react-native';

export interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  // Permitimos estilos personalizados tanto para el texto como para el contenedor
  style?: TextStyle | TextStyle[];
  containerStyle?: ViewStyle;
}