import React, { useState, useEffect } from "react";
import {
View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
TextInput,
Alert,
} from "react-native";
import { Gyroscope } from "expo-sensors";

export default function EscalaMaltrato() {

const preguntas = [
"¿Le han golpeado?",
"¿Le han dado puñetazos o patadas?",
"¿Le han empujado o jalado el pelo?",
"¿Le han aventado algún objeto?",
"¿Le han agredido con cuchillo o navaja?",
"¿Le han humillado o burlado?",
"¿Le han tratado con indiferencia?",
"¿Le han aislado de su familia?",
"¿Le han hecho sentir miedo?",
"¿No han respetado sus decisiones?",
"¿Le han prohibido salir o visitas?",
"¿Le han dejado sin ropa o calzado?",
"¿Le han dejado sin medicamentos?",
"¿Le han negado protección?",
"¿Le han negado acceso a su casa?",
"¿Alguien maneja su dinero sin permiso?",
"¿Le han quitado dinero?",
"¿Le han tomado bienes sin permiso?",
"¿Le han vendido propiedad sin consentimiento?",
"¿Lo han presionado para firmar documentos?",
"¿Le han exigido relaciones sexuales?",
"¿Le han tocado sin consentimiento?",
];

const [respuestas, setRespuestas] = useState({});

const seleccionar = (preguntaIndex, columna, valor) => {

let nuevaRespuesta = {
...respuestas[preguntaIndex],
[columna]: valor,
};

if (columna === "A" && valor === 0) {
nuevaRespuesta = { A: 0 };
}

setRespuestas({
...respuestas,
[preguntaIndex]: nuevaRespuesta,
});

};

const calcularTotal = () => {
let total = 0;
Object.values(respuestas).forEach((r) => {
if (r?.A === 1) total++;
});
return total;
};

const interpretarResultado = (total) => {

if (total === 0) return "Sin indicios de maltrato.";

if (total <= 3) return "Riesgo bajo de maltrato.";

if (total <= 8) return "Riesgo moderado de maltrato.";

return "Riesgo alto de maltrato. Se recomienda evaluación profesional.";

};

const columnasA = [
{ label: "No", value: 0 },
{ label: "Sí", value: 1 },
];

const columnasB = [
{ label: "1 vez", value: 1 },
{ label: "2-3 veces", value: 2 },
{ label: "Muchas", value: 3 },
];

const columnasC = [
{ label: "≤1 año", value: 1 },
{ label: ">1 año", value: 2 },
];

const columnasE = [
{ label: "H", value: 1 },
{ label: "M", value: 2 },
];

useEffect(() => {

Gyroscope.setUpdateInterval(300);

const subscription = Gyroscope.addListener((data) => {

const magnitude = Math.sqrt(
data.x * data.x +
data.y * data.y +
data.z * data.z
);

if (magnitude > 5) {

setRespuestas({});

Alert.alert(
"Movimiento detectado",
"La escala se reinició por movimiento fuerte."
);

}

});

return () => subscription.remove();

}, []);

const finalizarEvaluacion = () => {

if (Object.keys(respuestas).length !== preguntas.length) {

Alert.alert(
"Error",
"Debe responder todas las preguntas de la columna A."
);

return;

}

const total = calcularTotal();
const interpretacion = interpretarResultado(total);

Alert.alert(
"Resultado",
`Total de respuestas "Sí": ${total}

${interpretacion}`
);

};

return (

<ScrollView horizontal>

<ScrollView contentContainerStyle={styles.container}>

<Text style={styles.title}>Escala Geriátrica de Maltrato</Text>

<View style={styles.instruccionesBox}>

<Text style={styles.instruccionesTitulo}>Instrucciones</Text>

<Text style={styles.instruccionesText}>
A: Indique si la situación ocurrió (Sí o No).
</Text>

<Text style={styles.instruccionesText}>
B: Si ocurrió, indique cuántas veces.
</Text>

<Text style={styles.instruccionesText}>
C: Desde cuándo ocurre.
</Text>

<Text style={styles.instruccionesText}>
D: Parentesco.
</Text>

<Text style={styles.instruccionesText}>
E: Sexo de la persona.
</Text>

</View>

<View style={styles.headerRow}>
<Text style={styles.headerPregunta}>Pregunta</Text>
<Text style={styles.header}>A</Text>
<Text style={styles.header}>B</Text>
<Text style={styles.header}>C</Text>
<Text style={styles.header}>D</Text>
<Text style={styles.header}>E</Text>
</View>

{preguntas.map((pregunta, index) => {

const bloqueado = respuestas[index]?.A === 0;

return (

<View key={index} style={styles.row}>

<Text style={styles.pregunta}>
{index + 1}. {pregunta}
</Text>

<View style={styles.col}>
{columnasA.map((op, i) => (
<TouchableOpacity
key={i}
style={[
styles.option,
respuestas[index]?.A === op.value && styles.selected,
]}
onPress={() => seleccionar(index, "A", op.value)}
>
<Text>{op.label}</Text>
</TouchableOpacity>
))}
</View>

<View style={styles.col}>
{columnasB.map((op, i) => (
<TouchableOpacity
key={i}
disabled={bloqueado}
style={[
styles.option,
bloqueado && styles.disabled,
respuestas[index]?.B === op.value && styles.selected,
]}
onPress={() => seleccionar(index, "B", op.value)}
>
<Text>{op.label}</Text>
</TouchableOpacity>
))}
</View>

<View style={styles.col}>
{columnasC.map((op, i) => (
<TouchableOpacity
key={i}
disabled={bloqueado}
style={[
styles.option,
bloqueado && styles.disabled,
respuestas[index]?.C === op.value && styles.selected,
]}
onPress={() => seleccionar(index, "C", op.value)}
>
<Text>{op.label}</Text>
</TouchableOpacity>
))}
</View>

<View style={styles.col}>
<TextInput
style={[
styles.inputParentesco,
bloqueado && styles.disabled
]}
editable={!bloqueado}
placeholder="Parentesco"
value={respuestas[index]?.D || ""}
onChangeText={(text) => seleccionar(index, "D", text)}
/>
</View>

<View style={styles.col}>
{columnasE.map((op, i) => (
<TouchableOpacity
key={i}
disabled={bloqueado}
style={[
styles.option,
bloqueado && styles.disabled,
respuestas[index]?.E === op.value && styles.selected,
]}
onPress={() => seleccionar(index, "E", op.value)}
>
<Text>{op.label}</Text>
</TouchableOpacity>
))}
</View>

</View>

);

})}

<Text style={styles.total}>
Total (A = Sí): {calcularTotal()} / {preguntas.length}
</Text>

<TouchableOpacity
style={styles.button}
onPress={finalizarEvaluacion}
>

<Text style={styles.buttonText}>
Finalizar Evaluación
</Text>

</TouchableOpacity>

</ScrollView>

</ScrollView>

);

}

const styles = StyleSheet.create({

container:{padding:20},

title:{
fontSize:22,
fontWeight:"bold",
marginBottom:20
},

headerRow:{
flexDirection:"row",
marginBottom:10
},

headerPregunta:{
width:250,
fontWeight:"bold"
},

header:{
width:120,
fontWeight:"bold",
textAlign:"center"
},

row:{
flexDirection:"row",
marginBottom:15
},

pregunta:{
width:250
},

col:{
width:120,
alignItems:"center"
},

option:{
padding:6,
marginVertical:2,
backgroundColor:"#eee",
borderRadius:5,
width:100,
alignItems:"center"
},

selected:{
backgroundColor:"#90caf9"
},

disabled:{
backgroundColor:"#d3d3d3"
},

inputParentesco:{
backgroundColor:"#f2f2f2",
borderRadius:5,
padding:6,
width:100,
fontSize:12
},

total:{
fontSize:18,
fontWeight:"bold",
marginTop:20
},

button:{
backgroundColor:"#1565C0",
padding:15,
borderRadius:10,
alignItems:"center",
marginTop:20
},

buttonText:{
color:"white",
fontWeight:"bold"
},

instruccionesBox:{
backgroundColor:"#fff3cd",
padding:15,
borderRadius:8,
marginBottom:20
},

instruccionesTitulo:{
fontWeight:"bold",
fontSize:16,
marginBottom:8
},

instruccionesText:{
fontSize:14,
marginBottom:4
}

});