import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Button, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import SwitchPrueba from '../components/ui/SwitchPrueba';
import { SyncService } from '../services/syncService';

export default function Formulario() {
    const { pacienteId, nombrePaciente } = useLocalSearchParams();
    const finalizarPrueba = async (puntaje: number,diagnostico: string) => {    
        console.log(puntaje);
        if (!pacienteId) {
            Alert.alert("Error", "No hay un paciente vinculado a esta sesión.");
            return;
        }

        try {
            // 3. Guardar en Firebase usando tu SyncService [cite: 2]
            // Nota: Puedes agregar un método 'addResultadoPrueba' en tu syncService.ts similar a 'addPaciente'
            const response = await SyncService.addResultadoPrueba(String(pacienteId), String(nombrePaciente), "Prueba 20 Valoracion Entorno", puntaje, String(diagnostico)); 
            
            if (response.success) {
            Alert.alert("Éxito", `Prueba guardada para el paciente: ${nombrePaciente}`);
            //router.back(); // Regresar al menú tras finalizar
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo sincronizar con Firebase.");
            console.log(error);
        }
    };

    const router = useRouter();
    const [respuestas, setRespuestas] = useState(Array(50).fill(false));
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [fecha, setFecha] = useState('');
    const [sintomas, setSintomas] = useState('');
    const [cantidades, setCantidades] = useState('');

    // Estados para el sensor acelerómetro y la burbuja
    const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
    const bubbleX = useState(new Animated.Value(0))[0];
    const bubbleY = useState(new Animated.Value(0))[0];
    const submittedRef = useRef(false); // Evita múltiples envíos

    // Para el DatePicker
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        // Suscripción al acelerómetro
        const accelSub = Accelerometer.addListener(data => {
            setAccelData(data);
            actualizaBurbuja(data);

            // Condición para enviar: teléfono boca arriba y nivelado
            if (!submittedRef.current) {
                const { x, y } = data;
                const threshold = 0.5;
                console.log(x)
                const nivelado = y < 0.45; // boca arriba
                if (nivelado) {
                    submittedRef.current = true; // Evita múltiples envíos
                    // handleSubmit(); // Ejecuta el envío
                }
            }
        });

        Accelerometer.setUpdateInterval(100); // actualización rápida

        return () => accelSub.remove();
    }, []);

    const actualizaBurbuja = ({ x, y }: { x: number, y: number }) => {
        Animated.spring(bubbleX, {
            toValue: -x * 100, // escala el movimiento
            useNativeDriver: true,
            tension: 20,
            friction: 3,
        }).start();
        Animated.spring(bubbleY, {
            toValue: y * 100,
            useNativeDriver: true,
            tension: 20,
            friction: 3,
        }).start();
    };

    const onChangeDate = (event: any, selectedDate: any) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
        const dia = currentDate.getDate().toString().padStart(2, '0');
        const mes = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const año = currentDate.getFullYear();
        setFecha(`${dia}/${mes}/${año}`);
    };

    useEffect(() => {
        const cantidadSi = respuestas.filter(r => r).length;
        const cantidadNo = respuestas.length - cantidadSi;

        setCantidades(
            `Sí: ${cantidadSi}\nNo: ${cantidadNo}`
        );
    }, [respuestas]);

    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    // const handleSubmit = () => {
    //     // Alert.alert(
    //     //     "Evaluación Terminada",
    //     //     cantidades,
    //     //     [{ text: "OK", onPress: () => router.push('/PruebasMenu') }]
    //     // );
    //     // finalizarPrueba(0,String(cantidades));
    // };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
        >
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#000', marginVertical: 15, textAlign: 'center' }}>
                Evaluación de Entorno
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Nombre Completo"
                placeholderTextColor="#999"
                value={nombre}
                onChangeText={setNombre}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Fecha"
                placeholderTextColor="#999"
                value={fecha}
                onFocus={showDatepicker}
                showSoftInputOnFocus={false}
            />
            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                />
            )}

            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Síntomas"
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                value={sintomas}
                onChangeText={setSintomas}
            />

            {[
                "En su hogar existe espacio suficiente para permitir su libre movilidad",
                "De acuerdo a su condición de salud, ¿Su vivienda está adaptada para una persona mayor?",
                "¿Considera que su vivienda es la idónea de acuerdo a su condición de salud?",
                "El equipamiento para modificar su vivienda está disponible",
                "Está usted en posibilidades de cambiar a una vivienda mejor adaptada",
                "Cuando usted sale del hogar, considera que puede realizar su traslado sin problemas",
                "El camino para los peatones está libre de obstrucciones",
                "En su comunidad, las aceras presentan un correcto mantenimiento",
                "En su comunidad, las aceras están libres de obstrucciones",
                "Usted considera que las normas y reglas de tránsito se respetan",
                "Los edificios públicos que usted visita son accesibles",
                "Usted realiza actividad física en la comunidad y/o en el hogar",
                "Usted se encuentra interesado en realizar actividad física",
                "Considera que su situación de salud le permite realizar actividad física",
                "En su comunidad se promueve la actividad física",
                "Considera que las instalaciones para hacer actividad física toman en cuenta a personas mayores",
                "Considera que su comunidad es segura para realizar actividad física",
                "Considera que el flujo vehicular le permite realizar actividad física",
                "Tiene usted el tiempo para realizar actividad física",
                "Sabe usted cómo iniciar un programa seguro de actividad física en casa",
                "En su lugar de trabajo se promueve la actividad física",
                "Usted realiza actividad física en el trabajo",
                "Cuando ha acudido a consulta le han prescrito realizar actividad física",
                "Conoce lugares de encuentro para personas mayores en su comunidad",
                "Los sectores público y privado realizan actividades para adultos mayores",
                "Usted participa en actividades comunitarias",
                "Considera que la ubicación es conveniente",
                "Considera que el horario es conveniente",
                "La admisión para participantes es abierta",
                "El precio para participar constituye un problema",
                "Conoce la gama de actividades de su comunidad",
                "Tiene interés en llevarlas a cabo",
                "Las actividades estimulan la participación de diferentes edades",
                "Las instalaciones promueven el uso compartido",
                "Los lugares de encuentro promueven el intercambio entre vecinos",
                "El transporte público es accesible en precio",
                "El transporte público es confiable y frecuente",
                "Las rutas de transporte son adecuadas",
                "Los vehículos son accesibles según su condición de salud",
                "Las paradas del transporte son adecuadas",
                "La actitud del conductor es correcta",
                "Los camiones presentan buen estado de conservación",
                "Barreras para la movilidad dentro de su domicilio",
                "Barreras para la movilidad fuera de su domicilio",
                "Barreras para la movilidad en el transporte",
                "Presencia de barreras (dispositivos auxiliares)",
                "Ausencia de barreras (dispositivos auxiliares)",
                "Presencia de barreras (participación social)",
                "Ausencia de barreras (participación social)"
            ].map((pregunta, index) => (
                <SwitchPrueba
                    key={index}
                    texto={pregunta}
                    value={respuestas[index]}
                    onValueChange={(valor: boolean) => {
                        const nuevas = [...respuestas];
                        nuevas[index] = valor;
                        setRespuestas(nuevas);
                    }}
                />
            ))}

            <View style={{ backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8, marginVertical: 15 }}>
                <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Resultados Actuales:</Text>
                <Text style={{ color: '#000', textAlign: 'center', marginTop: 5 }}>{cantidades}</Text>
            </View>

            {/* Nivel de burbuja integrado */}
            <View style={styles.levelContainer}>
                <Text style={styles.levelTitle}>🌐 Nivel digital</Text>
                <Text style={styles.levelInstruction}>Pon el teléfono boca arriba para enviar automáticamente</Text>
                <View style={styles.levelBox}>
                    <Animated.View
                        style={[
                            styles.burbuja,
                            {
                                transform: [
                                    { translateX: bubbleX },
                                    { translateY: bubbleY },
                                ],
                            },
                        ]}
                    />
                </View>
                <Text style={styles.levelData}>
                    Inclinación: X: {accelData.x.toFixed(2)}  Y: {accelData.y.toFixed(2)}  Z: {accelData.z.toFixed(2)}
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Enviar Formulario" onPress={() => finalizarPrueba(0,String(cantidades))} />
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    contentContainer: {
        alignItems: "stretch",
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
        marginVertical: 8,
        fontSize: 16,
        color: '#000',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        marginVertical: 8,
    },
    levelContainer: {
        alignItems: 'center',
        marginVertical: 20,
        padding: 10,
        backgroundColor: '#eef',
        borderRadius: 10,
    },
    levelTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#000',
    },
    levelInstruction: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    levelBox: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'yellow',
        borderWidth: 4,
        borderColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 10,
    },
    burbuja: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'red',
        borderWidth: 3,
        borderColor: 'black',
        position: 'absolute',
    },
    levelData: {
        fontSize: 14,
        color: '#000',
    },
});