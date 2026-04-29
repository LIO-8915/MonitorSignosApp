import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Encabezado personalizado
function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <View style={styles.drawerHeader}>
        <View style={styles.logoCircle}>
          <Ionicons name="medical" size={35} color="#fff" />
        </View>
        <Text style={styles.drawerTitle}>GediatricApp</Text>
        <Text style={styles.drawerSubtitle}>Dispositivos Móviles 2</Text>
      </View>

      <View style={styles.menuItemsContainer}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Semestre 8 - CICIMAR</Text>
      </View>
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
          headerTitleAlign: 'center',
          headerTintColor: '#1976d2',
          drawerActiveBackgroundColor: '#e3f2fd',
          drawerActiveTintColor: '#1976d2',
          drawerInactiveTintColor: '#455a64',
          drawerLabelStyle: {
            fontSize: 15,
            fontWeight: '600',
            marginLeft: -10,
          },
          drawerItemStyle: {
            borderRadius: 12,
            marginHorizontal: 10,
            marginVertical: 4,
          },
        }}
      >
        {/* === SECCIÓN DE PACIENTES === */}
        <Drawer.Screen 
          name="Pacientes" 
          options={{ 
            drawerLabel: 'Pacientes',
            title: 'Mis Pacientes',
            drawerIcon: ({ color }) => <Ionicons name="people-sharp" size={22} color={color} />
          }} 
        />

        {/* === SECCIÓN DE EVALUACIONES === */}
        <Drawer.Screen 
          name="PruebasMenu" 
          options={{ 
            drawerLabel: 'Menú de Pruebas',
            title: 'Menú de Pruebas',
            drawerIcon: ({ color }) => <Ionicons name="fitness-sharp" size={22} color={color} />
          }} 
        />

        {/* === SECCIÓN DE AGENDA === */}
        <Drawer.Screen 
          name="ControlCitas" 
          options={{ 
            drawerLabel: 'Menú de Citas',
            title: 'Menú de Citas',
            drawerIcon: ({ color }) => <Ionicons name="calendar-sharp" size={22} color={color} />
          }} 
        />

        {/* === SECCIÓN DE GRÁFICAS Y ESTADÍSTICAS === */}
        <Drawer.Screen 
          name="Graph" 
          options={{ 
            drawerLabel: 'Reportes y Gráficas',
            title: 'Estadísticas del Paciente',
            drawerIcon: ({ color }) => <Ionicons name="bar-chart-sharp" size={22} color={color} />
          }} 
        />

        {/* === OTRAS OPCIONES OPERATIVAS (VISIBLES) === */}
        <Drawer.Screen 
          name="CitasPendietes" 
          options={{ 
            drawerLabel: 'Citas Pendientes',
            title: 'Pendientes',
            drawerIcon: ({ color }) => <Ionicons name="time-sharp" size={22} color={color} />
          }} 
        />

        <Drawer.Screen 
          name="AgendarCita" 
          options={{ 
            drawerLabel: 'Nueva Cita',
            title: 'Agendar Consulta',
            drawerIcon: ({ color }) => <Ionicons name="add-circle-sharp" size={22} color={color} />
          }} 
        />

        {/* === PANTALLAS OCULTAS (SIN ICONO NECESARIO) === */}
        <Drawer.Screen name="index" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="modal" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="CitasEnCurso" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="Cita" options={{ drawerItemStyle: { display: 'none' } }} />
        
        {/* Registro de pruebas individuales (Ocultas) */}
        {[
          "Prueba20Entorno", "Prueba19Maltrato", "Prueba18OARSScreen", 
          "Prueba15MNA-SF", "Prueba13Auditiva", "Prueba12Norton", 
          "Prueba11Braden", "Prueba8Lawton", "Prueba7KatzIndex", 
          "Prueba6CESD7Test", "Prueba5Formulario", "Prueba4Moca", 
          "Prueba3Minimental"
        ].map(prueba => (
          <Drawer.Screen 
            key={prueba}
            name={prueba} 
            options={{ drawerItemStyle: { display: 'none' } }} 
          />
        ))}

      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    backgroundColor: '#1976d2',
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    marginBottom: 10,
  },
  logoCircle: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  drawerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  drawerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  menuItemsContainer: {
    flex: 1,
    marginTop: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#999',
  },
});