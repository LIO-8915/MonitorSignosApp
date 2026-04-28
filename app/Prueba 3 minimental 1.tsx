import { Accelerometer } from 'expo-sensors';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomDatePicker } from '../components/ui/datepicker 1';
import { FormDropdown } from '../components/ui/dropDown 1';
import { FormField } from '../components/ui/formField 1';
import { FormSection } from '../components/ui/formSection 1';

const preguntas = [
    { id: 0, pregunta: '¿Qué año es?', Encabezado: 'Orientación Temporal' },
    { id: 1, pregunta: '¿En qué mes estamos?', Encabezado: 'Orientación Temporal' },
    { id: 2, pregunta: '¿Qué día del mes es hoy?', Encabezado: 'Orientación Temporal' },
    { id: 3, pregunta: '¿Qué día de la semana es hoy?', Encabezado: 'Orientación Temporal' },
    { id: 4, pregunta: '¿En qué Lugar estamos?', nota: 'Nota: 30 minutos más o menos a la hora actual, es una respuesta correcta.', Encabezado: 'Orientación Espacial' },
    { id: 5, pregunta: '¿En qué país estamos?', Encabezado: 'Orientación Espacial' },
    { id: 6, pregunta: '¿En qué estado estamos?', Encabezado: 'Orientación Espacial' },
    { id: 7, pregunta: '¿En qué Ciudad estamos?', Encabezado: 'Orientación Espacial' },
    { id: 8, pregunta: '¿En qué Lugar estamos?', nota: 'Nota: "El hospital", "El consultorio", "Una Clínica" son respuestas correctas.', Encabezado: 'Orientación Espacial' },
    { id: 9, pregunta: '¿En qué piso estamos?', Encabezado: 'Orientación Espacial' },
    { id: 10, pregunta: 'Voy a decir a decir tres palabras. Repítalas después de mí.\r\n Palabras: Casa, Árbol, Perro', Encabezado: 'Memoria Inmediata', nota: 'Marque cada palabra que el paciente dijo correctamente' },
    { id: 11, pregunta: '¿Puede decirme los resultados de restar de 7 en 7 comenzando en el número 100?', Encabezado: 'Atención y Cálculo', nota: 'Marque cada número que el paciente dijo correctamente' },
    { id: 12, pregunta: '¿Puede decirme las tres palabras que le pedí recordar antes?', Encabezado: 'Memoria', nota: 'Marque cada palabra que el paciente dijo correctamente' },
    { id: 13, pregunta: '¿Puede repetir después de mí la frase "Ni sí, ni no, ni pero"?', Encabezado: 'Repeteción' },
    { id: 14, pregunta: 'Tome  este papel con la mano derecha, dóblelo por la mitad y póngalo en el suelo', Encabezado: 'Comprensión de Ordenes', nota: 'Marque cada acción que el paciente realizó correctamente' },
    { id: 15, pregunta: '¿Puede decirme que es el objeto de la imagen?', Encabezado: 'Lenguaje', nota: 'Marque correcto si el paciente dijo que es un Reloj' },
    { id: 16, pregunta: '¿Puede decirme que es el objeto de la imagen?', Encabezado: 'Lenguaje', nota: 'Marque correcto si el paciente dijo que es un Lápiz' },
    { id: 17, pregunta: '¿Puede leer la imagen y realizar lo que se pide?', Encabezado: 'Lectura', nota: 'Marque correcto si el paciente cerró los ojos' }
];


export default function PruebaMiniMental() {
    const [escolaridad, setEscolaridad] = useState<number | null>(null);
    const puntajeEscolaridad =
        escolaridad !== null && escolaridad < 3 ? 5 : 0;
    const [respuestas, setRespuestas] = useState<{ [key: number]: boolean }>({});
    const [palabrasMemoria, setPalabrasMemoria] = useState({
        casa: false,
        arbol: false,
        perro: false
    });
    const [acciones, setAcciones] = useState({
        tomarDerecha: false,
        doblar: false,
        tirar: false
    });
    const [numeros, setNumRes] = useState({
        93: false,
        86: false,
        79: false,
        72: false,
        65: false
    });
    const [palabrasRecuerdo, setPalabrasRecuerdo] = useState({
        casa: false,
        arbol: false,
        perro: false
    });
    const puntajeRecuerdo = Object.values(palabrasRecuerdo).filter(Boolean).length;
    const puntajeOrientacion = Object.values(respuestas).filter(Boolean).length;
    const puntajeMemoria = Object.values(palabrasMemoria).filter(Boolean).length;
    const puntajeNumeros = Object.values(numeros).filter(Boolean).length;
    const puntajeAcciones = Object.values(acciones).filter(Boolean).length;
    const puntaje =
        puntajeOrientacion +
        puntajeMemoria +
        puntajeNumeros +
        puntajeRecuerdo +
        puntajeAcciones +
        puntajeEscolaridad;

    const togglePalabra = (palabra: keyof typeof palabrasMemoria) => {
        setPalabrasMemoria(prev => ({
            ...prev,
            [palabra]: !prev[palabra]
        }));
    };

    const toggleAcciones = (palabra: keyof typeof acciones) => {
        setAcciones(prev => ({
            ...prev,
            [palabra]: !prev[palabra]
        }));
    };

    const toggleNumeros = (numero: keyof typeof numeros) => {
        setNumRes(prev => ({
            ...prev,
            [numero]: !prev[numero]
        }));
    };

    const toggleRespuesta = (id: number) => {
        setRespuestas(prev => ({ ...prev, [id]: !prev[id] }));
    };
    const togglePalabraRecuerdo = (palabra: keyof typeof palabrasRecuerdo) => {
        setPalabrasRecuerdo(prev => ({
            ...prev,
            [palabra]: !prev[palabra]
        }));
    };
    const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
    const [sexo, setSexo] = useState('');
    const [discapacidades, setDiscapacidades] = React.useState({
        visual: false,
        auditiva: false,
        motriz: false,
        ninguna: true,
    });

    const [formKey, setFormKey] = useState(0);

    const clearForm = useCallback(() => {
        setFechaNacimiento(new Date());
        setSexo('');
        setDiscapacidades({
            visual: false,
            auditiva: false,
            motriz: false,
            ninguna: true,
        });
        setRespuestas({});

        setFormKey(prevKey => prevKey + 1);
        console.log("Shaked");
    }, [formKey]);

    useEffect(() => {
        let subscription: any;

        let lastUpdate = 0;
        let last_x = 0;

        let shakeCount = 0;
        let lastShakeTime = 0;

        if (Platform.OS !== 'web') {
            Accelerometer.setUpdateInterval(100);

            subscription = Accelerometer.addListener((accelerometerData: any) => {
                const { x } = accelerometerData;
                const currentTime = Date.now();

                if ((currentTime - lastUpdate) > 100) {
                    lastUpdate = currentTime;

                    const deltaX = Math.abs(x - last_x);

                    if (deltaX > 1.2) {

                        if (lastShakeTime !== 0 && currentTime - lastShakeTime > 2000) {
                            shakeCount = 0;
                            console.log("Ya pasó el tiempo");
                        }

                        shakeCount++;
                        lastShakeTime = currentTime;
                        console.log(` Sacudida (Llevas ${shakeCount} de 3)`);

                        if (shakeCount >= 6) {
                            shakeCount = 0;
                            lastShakeTime = 0;
                            clearForm();
                        }
                    }

                    last_x = x;
                }
            });
        }

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, [clearForm]);

    const { width } = useWindowDimensions();
    const isMobile = width < 600;

    const dynamicRowStyle = [
        styles.row,
        { flexDirection: isMobile ? 'column' : 'row' as 'column' | 'row' }
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            {/* Sticky score bar - va ANTES del ScrollView */}
            <View style={styles.stickyScore}>
                <Text style={styles.stickyScoreLabel}>Puntaje orientación</Text>
                <View style={styles.stickyScoreBadge}>
                    <Text style={styles.stickyScoreText}>{puntaje} / 28 </Text>
                </View>
                <View style={styles.stickyProgressBar}>
                    <View style={[styles.stickyProgressFill, {
                        width: `${(puntaje / 28) * 100}%`,
                        backgroundColor: puntaje >= 24 ? '#2ECC71' : puntaje >= 5 ? '#F39C12' : '#E74C3C'
                    }]} />
                </View>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

                <View style={styles.headerCard}>
                    <View style={styles.iconBadge}>
                        <Text style={{ fontSize: 28 }}>🧠</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>Evaluación Mini Mental</Text>
                        <Text style={styles.subtitle}>Pruebas sobre deterioro cognitivo leve</Text>
                    </View>
                </View>

                <View key={`form-container-${formKey}`}>
                    <FormSection title="Datos Personales del Paciente" subtitle="Información básica del paciente geriátrico">
                        <View style={dynamicRowStyle}>
                            <FormField label="Nombre *" placeholder="Ej. Juan" />
                        </View>

                        <View style={dynamicRowStyle}>
                            <FormField label="Apellido 1 *" placeholder="Ej. García" />
                            <FormField label="Apellido 2 *" placeholder="Ej. López" />
                        </View>

                        <CustomDatePicker
                            label="Fecha de Aplicación de la Prueba *"
                            value={fechaNacimiento}
                            onChange={setFechaNacimiento}
                        />

                        <View style={[styles.row, { flexDirection: isMobile ? 'column' : 'row' }]}>
                            <View style={{ flex: isMobile ? 1 : 0.4 }}>
                                <FormDropdown
                                    label="Sexo *"
                                    placeholder="Seleccionar"
                                    data={[
                                        { label: 'Masculino', value: 'M' },
                                        { label: 'Femenino', value: 'F' },
                                        { label: 'Prefiero no decirlo', value: 'P' }
                                    ]}
                                    value={sexo}
                                    onChange={setSexo}
                                />
                            </View>
                            <View style={{ flex: isMobile ? 1 : 0.6 }}>
                                <FormField
                                    label="Años de Escolaridad"
                                    placeholder="Ej. 6"
                                    keyboardType="numeric"
                                    value={escolaridad !== null ? String(escolaridad) : ""}
                                    onChangeText={(text) => {
                                        if (text === "") {
                                            setEscolaridad(null);
                                        } else {
                                            const num = parseInt(text, 10);
                                            setEscolaridad(num);

                                            if (num < 3) {
                                                setNumRes({
                                                    93: false,
                                                    86: false,
                                                    79: false,
                                                    72: false,
                                                    65: false
                                                });
                                            }
                                        }
                                    }}
                                />
                            </View>
                        </View>
                    </FormSection>

                    <FormSection title="Preparación" subtitle="">
                        <View style={styles.verticalGroup}>
                            <View style={styles.instructionBox}>
                                <Text style={styles.instructionText}>
                                    <Text style={{ fontWeight: '800', color: '#0056D2' }}>Diga al paciente: </Text>
                                    "Le voy a hacer unas preguntas sencillas para evaluar su estado mental"
                                </Text>
                            </View>
                            <Text style={styles.noteText}>
                                Nota: El evaluador debe captar la atención del paciente.
                            </Text>
                        </View>

                    </FormSection>


                    {preguntas
                        .filter(item => !(((escolaridad as number) < 3 || escolaridad === null) && item.id === 11))
                        .map((item) => (
                            <FormSection key={item.id} title={item.Encabezado} subtitle="">
                                <View style={styles.verticalGroup}>
                                    <View style={styles.instructionBox}>
                                        <Text style={styles.instructionText}>
                                            <Text style={{ fontWeight: '800', color: '#0056D2' }}>
                                                Pregunte al paciente:
                                            </Text>{' '}
                                            <Text style={styles.keywordText}>{item.pregunta}</Text>
                                        </Text>
                                    </View>

                                    {item.nota && <Text style={styles.noteText}>{item.nota}</Text>}

                                    {item.id === 10 ? (
                                        <>
                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() => togglePalabra('casa')}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        palabrasMemoria.casa && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {palabrasMemoria.casa && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>Casa</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() => togglePalabra('arbol')}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        palabrasMemoria.arbol && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {palabrasMemoria.arbol && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>Árbol</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() => togglePalabra('perro')}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        palabrasMemoria.perro && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {palabrasMemoria.perro && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>Perro</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : item.id === 11 ? (
                                        <>
                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() => toggleNumeros(93)}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        numeros[93] && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {numeros[93] && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>93</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() => toggleNumeros(86)}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        numeros[86] && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {numeros[86] && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>86</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() => toggleNumeros(79)}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        numeros[79] && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {numeros[79] && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>79</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() => toggleNumeros(72)}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        numeros[72] && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {numeros[72] && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>72</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() => toggleNumeros(65)}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        numeros[65] && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {numeros[65] && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>65</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : item.id === 12 ? (
                                        <>
                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() => togglePalabraRecuerdo('casa')}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        palabrasRecuerdo.casa && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {palabrasRecuerdo.casa && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>Casa</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() => togglePalabraRecuerdo('arbol')}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        palabrasRecuerdo.arbol && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {palabrasRecuerdo.arbol && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>Árbol</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() => togglePalabraRecuerdo('perro')}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        palabrasRecuerdo.perro && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {palabrasRecuerdo.perro && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>Perro</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : item.id === 14 ? (
                                        <>
                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() => toggleAcciones('tomarDerecha')}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        acciones.tomarDerecha && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {acciones.tomarDerecha && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>Tomar con la derecha</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() => toggleAcciones('doblar')}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        acciones.doblar && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {acciones.doblar && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>Doblar por la mitad</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() => toggleAcciones('tirar')}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        acciones.tirar && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {acciones.tirar && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>Tirar al suelo</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : item.id === 15 || item.id === 16 || item.id === 17 ? (
                                        <>
                                            <View style={styles.imageContainer}>
                                                <Image
                                                    source={
                                                        item.id === 15
                                                            ? require('../assets/images/reloj.jpg')
                                                            : item.id === 16
                                                                ? require('../assets/images/lapiz2.png')
                                                                : require('../assets/images/cierralosojos.png')
                                                    }
                                                    style={styles.testImage}
                                                    resizeMode="contain"
                                                />
                                            </View>

                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() => toggleRespuesta(item.id)}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        respuestas[item.id] && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {respuestas[item.id] && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </View>

                                                <Text
                                                    style={[
                                                        styles.checkboxLabel,
                                                        respuestas[item.id] && styles.checkboxLabelChecked,
                                                    ]}
                                                >
                                                    {respuestas[item.id]
                                                        ? 'Respuesta correcta'
                                                        : 'Marcar como correcta'}
                                                </Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        /* PREGUNTAS NORMALES */
                                        <TouchableOpacity
                                            style={styles.checkboxRow}
                                            onPress={() => toggleRespuesta(item.id)}
                                            activeOpacity={0.7}
                                        >
                                            <View
                                                style={[
                                                    styles.checkbox,
                                                    respuestas[item.id] && styles.checkboxChecked,
                                                ]}
                                            >
                                                {respuestas[item.id] && (
                                                    <Text style={styles.checkmark}>✓</Text>
                                                )}
                                            </View>

                                            <Text
                                                style={[
                                                    styles.checkboxLabel,
                                                    respuestas[item.id] && styles.checkboxLabelChecked,
                                                ]}
                                            >
                                                {respuestas[item.id]
                                                    ? 'Respuesta correcta'
                                                    : 'Marcar como correcta'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}</View>
                            </FormSection>
                        ))}
                </View>

                <FormSection title="Resultados" subtitle="">
                    <View style={styles.verticalGroup}>
                        <View style={styles.instructionBox}>
                            <Text style={styles.instructionText}>
                                <Text style={{ fontWeight: '800', color: '#0056D2' }}>Interpretación: </Text>
                                {puntaje >= 24 ? 'Resultado normal' : puntaje >= 19 ? 'Resultado ligeramente alterado' : 'Resultado alterado'}
                            </Text>
                        </View>
                        <Text style={styles.noteText}>
                            Nota: Resultados entre 24 y 30 son normales, entre 19 y 23 indican deterioro cognitivo leve, entres 10 y 18 deterioro moderado y menor a 10 daño cognitivo severo.
                        </Text>
                    </View>
                </FormSection>

                <View style={[
                    styles.footer,
                    {
                        flexDirection: isMobile ? 'column-reverse' : 'row',
                        justifyContent: 'flex-end'
                    }
                ]}>
                    <TouchableOpacity style={[styles.btnCancel, isMobile && { width: '100%' }]}>
                        <Text style={styles.btnTextCancel}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.btnSubmit, isMobile && { width: '100%' }]}>
                        <Text style={styles.btnTextSubmit}>Registrar Puntuaciones</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    verticalGroup: {
        width: '100%',
        marginBottom: 15,
        flexDirection: 'column',
    },
    noteText: {
        fontSize: 12,
        color: '#6C757D',
        fontStyle: 'italic',
        marginTop: 4
    },
    headerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    iconBadge: {
        backgroundColor: '#E8F0FE',
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    sectionCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#001D3D', marginBottom: 12 },

    instructionBox: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#0056D2',
        marginBottom: 12,
    },
    scoreContainer: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F3F5' },
    scoreHint: { fontSize: 11, color: '#ADB5BD', marginTop: 4 },
    instructionText: { fontSize: 15, lineHeight: 22, color: '#343A40' },
    keywordText: { fontWeight: 'bold', color: '#000', fontStyle: 'italic' },
    safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
    container: { flex: 1, padding: 16 },
    contentContainer: { paddingHorizontal: 20, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 30, gap: 15 },
    iconContainer: { backgroundColor: '#E7F0FF', padding: 12, borderRadius: 10 },
    headerIcon: { fontSize: 24, color: '#0066FF' },
    title: { fontSize: 20, fontWeight: 'bold', color: '#001D3D' },
    subtitle: { fontSize: 13, color: '#666' },
    row: { gap: 12, width: '100%', marginBottom: 5 },
    footer: { marginTop: 20, gap: 12, marginBottom: 20 },
    btnCancel: { paddingVertical: 14, paddingHorizontal: 25, borderRadius: 10, borderWidth: 1, borderColor: '#DDD', backgroundColor: '#FFF', alignItems: 'center' },
    btnSubmit: { backgroundColor: '#000814', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 10, alignItems: 'center' },
    btnTextCancel: { color: '#333', fontWeight: '700' },
    btnTextSubmit: { color: '#FFF', fontWeight: '700' },
    labelGroup: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#1A1A1A' },
    stickyScore: {
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    stickyScoreLabel: { fontSize: 13, color: '#6C757D', fontWeight: '600', flex: 1 },
    stickyScoreBadge: {
        backgroundColor: '#001D3D',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    stickyScoreText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
    stickyProgressBar: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 3,
        backgroundColor: '#E9ECEF',
    },
    stickyProgressFill: { height: 3, borderRadius: 2 },

    // Checkbox
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    checkbox: {
        width: 24, height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#CED4DA',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    checkboxChecked: { backgroundColor: '#2ECC71', borderColor: '#2ECC71' },
    checkmark: { color: '#FFF', fontSize: 14, fontWeight: '800' },
    checkboxLabel: { fontSize: 14, color: '#6C757D' },
    checkboxLabelChecked: { color: '#2ECC71', fontWeight: '700' },
    imageContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
    },

    testImage: {
        width: 120,
        height: 120,
    }

});