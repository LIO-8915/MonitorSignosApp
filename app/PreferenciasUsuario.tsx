import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

const PreferenciasApp = () => {
    const [nombre, setNombre] = useState('Preferencias1');
    const [nombreGuardado, setNombreGuardado] = useState('Preferencias2');
    // Función para guardar nombre en AsyncStorage
    const guardarNombre = async () => {
        try {
            await AsyncStorage.setItem('usuario', nombre); // Guarda 'nombre' bajo la clave 'usuario'
            alert('Nombre guardado');
        } catch (error) {
            console.error('Error al guardar:', error);
        }
    };
    // Función para recuperar nombre guardado
    const leerNombre = async () => {
        try {
            const valor = await AsyncStorage.getItem('usuario'); // Lee el valor de la clave 'usuario'
            if (valor !== null) {
                setNombreGuardado(valor); // Muestra el valor guardado
            }
        } catch (error) {
            console.error('Error al leer:', error);
        }
    };
    // Al cargar el componente, intenta leer el nombre guardado
    useEffect(() => { leerNombre();}, []);
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Ingresa tu nombre:</Text>
            <TextInput
                style={styles.input}
                placeholder="Escribe aquí"
                value={nombre}
                onChangeText={setNombre}/>
            <Button title="Guardar nombre" onPress={guardarNombre}/>
            <Text style={styles.resultado}>Nombre guardado: {nombreGuardado}</Text>
        </View>
    );
};
const styles = StyleSheet.create({
    container: { padding: 20, marginTop: 50 },
    label: { fontSize: 18 },
    input: { borderWidth: 1, borderColor: '#999', marginBottom:
    10, padding: 8 },
    resultado: { marginTop: 20, fontSize: 16, color: 'green' },
});
export default PreferenciasApp;