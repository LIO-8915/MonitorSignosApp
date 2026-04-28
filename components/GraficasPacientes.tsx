import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { Prueba } from '../services/database';

const screenWidth = Dimensions.get('window').width;

interface Props {
  historial: Prueba[];
}

const GraficasPaciente: React.FC<Props> = ({ historial }) => {
  if (!historial || historial.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Sin datos para graficar el porcentaje.</Text>
      </View>
    );
  }

  // 1. Transformación de datos a PORCENTAJES
  // Calculamos: (obtenido / maximo) * 100
  const chartData = historial.map((p) => {
    const porcentaje = (p.puntuacion / p.puntuacion_maxima) * 100;
    return {
      value: porcentaje,
      label: `P${p.numero_prueba}`,
      dataPointText: `${porcentaje.toFixed(0)}%`, // Texto sobre el punto
      frontColor: '#df96c0',
    };
  });

  // 2. Datos para la Dona (Última prueba en porcentaje)
  const ultima = historial[historial.length - 1];
  const porcentajeUltima = (ultima.puntuacion / ultima.puntuacion_maxima) * 100;
  
  const pieData = [
    { value: porcentajeUltima, color: '#df96c0' },
    { value: 100 - porcentajeUltima, color: '#eeeeee' },
  ];

  return (
    <View style={styles.container}>
      
      {/* 1. GRÁFICA DE LÍNEAS (Evolución % ) */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Tendencia de Rendimiento (%)</Text>
        <LineChart
          data={chartData}
          height={160}
          width={screenWidth - 140}
          maxValue={100} // El límite siempre es 100%
          noOfSections={5}
          color="#df96c0"
          thickness={4}
          showValuesAsDataPointsText
          yAxisTextStyle={styles.axisLabel}
          xAxisLabelTextStyle={styles.axisLabel}
          rulesType="dashed"
          rulesColor="#eee"
        />
      </View>

      {/* 2. GRÁFICA DE BARRAS (Porcentajes por Prueba) */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Comparativa de Logro (%)</Text>
        <BarChart
          data={chartData}
          barWidth={35}
          height={160}
          width={screenWidth - 140}
          maxValue={100}
          noOfSections={4}
          barBorderRadius={6}
          yAxisTextStyle={styles.axisLabel}
          xAxisLabelTextStyle={styles.axisLabel}
        />
      </View>

      {/* 3. GRÁFICA DE ÁREA (Evolución Visual %) */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Progreso Acumulado (%)</Text>
        <LineChart
          areaChart
          data={chartData}
          height={160}
          width={screenWidth - 140}
          maxValue={100}
          color="#df96c0"
          startFillColor="#df96c0"
          startOpacity={0.4}
          curved
          hideDataPoints
          yAxisTextStyle={styles.axisLabel}
        />
      </View>

      {/* 4. GRÁFICA DE DONA (Porcentaje Final) */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Estado de Última Prueba</Text>
        <PieChart
          data={pieData}
          radius={85}
          innerRadius={65}
          centerLabelComponent={() => {
            return (
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontSize: 26, fontWeight: 'bold', color: '#df96c0'}}>
                  {porcentajeUltima.toFixed(0)}%
                </Text>
                <Text style={{fontSize: 10, color: '#666', textAlign: 'center'}}>
                  {ultima.nombre_prueba}
                </Text>
              </View>
            );
          }}
        />
        <Text style={styles.pieSubtext}>
          {ultima.puntuacion} de {ultima.puntuacion_maxima} puntos totales
        </Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  emptyContainer: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 14 },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  axisLabel: { color: '#888', fontSize: 10 },
  pieSubtext: {
    marginTop: 15,
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  }
});

export default GraficasPaciente;