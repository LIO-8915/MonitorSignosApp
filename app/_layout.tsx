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

import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: true, // Esto asegura que la barra superior aparezca
          headerTitleAlign: 'center',
          drawerActiveTintColor: '#1976d2',
        }}
      >
        {/* Pantalla de Pacientes */}
        <Drawer.Screen 
          name="Pacientes" 
          options={{ 
            drawerLabel: 'Lista de Pacientes',
            title: 'Pacientes',
            drawerIcon: ({color}) => <Ionicons name="people" size={20} color={color} />
          }} 
        />

        {/* Pantalla de Menú de Pruebas */}
        <Drawer.Screen 
          name="PruebasMenu" 
          options={{ 
            drawerLabel: 'Menú de Pruebas',
            title: 'Evaluaciones Geriátricas',
            drawerIcon: ({color}) => <Ionicons name="clipboard" size={20} color={color} />
          }} 
        />

        {/* Agrega aquí las demás pantallas principales como ControlCita */}
        <Drawer.Screen 
          name="ControlCita" 
          options={{ 
            drawerLabel: 'Agenda',
            title: 'Control de Citas',
            drawerIcon: ({color}) => <Ionicons name="calendar" size={20} color={color} />
          }} 
        />

        {/* Agrega aquí las pantallas que no se veran */}
        <Drawer.Screen 
          name="modal" 
          options={{ 
            drawerItemStyle: { display: 'none' } // Esto lo oculta del menú completamente
          }} 
        />

        <Drawer.Screen 
          name="index" 
          options={{ 
            drawerItemStyle: { display: 'none' } // Esto lo oculta del menú completamente
          }} 
        />

        <Drawer.Screen 
          name="Graph" 
          options={{ 
            drawerItemStyle: { display: 'none' } // Esto lo oculta del menú completamente
          }} 
        />

      </Drawer>
    </GestureHandlerRootView>
  );
}