// import { useColorScheme } from '@/hooks/use-color-scheme';
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import React, { useEffect, useState } from 'react';
// import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
// import { ActivityIndicator, Button, LogBox, StyleSheet, Text, View } from 'react-native';
// import { DatabaseService } from '../services/database';

// function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
//   const message = error instanceof Error ? error.message : "Error desconocido";
//   return (
//     <View style={styles.errorCentered}>
//       <Text style={styles.errorTitle}>Algo salió mal</Text>
//       <Text style={styles.errorDescription}>{message}</Text>
//       <Button title="Reintentar" onPress={resetErrorBoundary} color="#C53030" />
//     </View>
//   );
// }

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [appIsReady, setAppIsReady] = useState(false);

//   useEffect(() => {
//     LogBox.ignoreLogs(['Setting a timer']);
//     async function initializeApp() {
//       try {
//         await DatabaseService();
//       } catch (e) {
//         console.error("Fallo de inicialización:", e);
//       } finally {
//         setAppIsReady(true);
//       }
//     }
//     initializeApp();
//   }, []);

//   if (!appIsReady) {
//     return (
//       <View style={styles.loading}>
//         <ActivityIndicator size="large" color="#007AFF" />
//       </View>
//     );
//   }

//   return (
//     <ErrorBoundary FallbackComponent={ErrorFallback}>
//       <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//         <Stack>
//           <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         </Stack>
//         <StatusBar style="auto" />
//       </ThemeProvider>
//     </ErrorBoundary>
//   );
// }

// const styles = StyleSheet.create({
//   loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   errorCentered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#C53030', marginBottom: 10 },
//   errorDescription: { textAlign: 'center', marginBottom: 20, color: '#666' }
// });

import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

/**
 * Layout Raíz (app/_layout.tsx)
 * Este archivo configura el menú lateral (Drawer) como navegación principal.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer screenOptions={{ headerTitleAlign: 'center', drawerActiveTintColor: '#007AFF' }}>
        
        {/* Pantalla: Pacientes */}
        <Drawer.Screen 
          name="pacientes" 
          options={{ 
            drawerLabel: 'Gestión de Pacientes', 
            title: 'Pacientes' 
          }} 
        />

        {/* Pantalla: PruebasMenu */}
        <Drawer.Screen 
          name="pruebas-menu" 
          options={{ 
            drawerLabel: 'Menú de Pruebas', 
            title: 'Evaluaciones' 
          }} 
        />

        {/* Pantalla: ControlCita */}
        <Drawer.Screen 
          name="control-cita" 
          options={{ 
            drawerLabel: 'Control de Citas', 
            title: 'Agenda' 
          }} 
        />

        {/* Pantalla: RegistroPersonalMedico */}
        <Drawer.Screen 
          name="registro-personal" 
          options={{ 
            drawerLabel: 'Personal Médico', 
            title: 'Staff' 
          }} 
        />

        {/* Pantalla oculta del menú: Registro de Pacientes */}
        <Drawer.Screen
          name="registro-pacientes"
          options={{
            drawerItemStyle: { display: 'none' }, // No aparece en la lista del menú lateral
            title: 'Registro de Nuevo Paciente',
          }}
        />

      </Drawer>
    </GestureHandlerRootView>
  );
}