import { Redirect } from 'expo-router';

// Esto redirige automáticamente a la pantalla de Pacientes al abrir la app
export default function Index() {
  return <Redirect href="/Pacientes" />;
}