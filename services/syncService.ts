import AsyncStorage from '@react-native-async-storage/async-storage';
import { child, get, push, ref, set } from 'firebase/database'; // Importaciones de RTDB
import { db } from './firebase';

/**
 * SyncService: Gestiona la comunicación entre la base de datos remota (Firebase)
 * y el almacenamiento local (AsyncStorage/SQLite).
 */
export const SyncService = {
  
  // 1. AGREGAR PACIENTE a RTDB
  addPaciente: async (paciente: any) => {
    try {
      // Referencia al nodo 'pacientes'
      const pacientesRef = ref(db, 'pacientes');
      // Genera un nuevo nodo con ID único
      const nuevoPacienteRef = push(pacientesRef);

      const dataFinal = {
        ...paciente,
        timestamp: new Date().toISOString()
      };

      // Guardar en la nube
      await set(nuevoPacienteRef, dataFinal);

      // Actualizar espejo local
      const locales = await AsyncStorage.getItem('@pacientes_local');
      const lista = locales ? JSON.parse(locales) : [];
      lista.push({ ...dataFinal, id: nuevoPacienteRef.key });
      await AsyncStorage.setItem('@pacientes_local', JSON.stringify(lista));

      console.log("✅ Paciente en RTDB con ID:", nuevoPacienteRef.key);
      return { success: true, id: nuevoPacienteRef.key };
    } catch (error) {
      console.error("❌ Error en RTDB (Paciente):", error);
      throw error;
    }
  },

  // 2. AGREGAR MÉDICO a RTDB
  addMedico: async (medico: any) => {
    try {
      const medicosRef = ref(db, 'medicos');
      const nuevoMedicoRef = push(medicosRef);

      const dataFinal = {
        ...medico,
        timestamp: new Date().toISOString()
      };

      await set(nuevoMedicoRef, dataFinal);

      const locales = await AsyncStorage.getItem('@medicos_local');
      const lista = locales ? JSON.parse(locales) : [];
      lista.push({ ...dataFinal, id: nuevoMedicoRef.key });
      await AsyncStorage.setItem('@medicos_local', JSON.stringify(lista));

      console.log("✅ Médico en RTDB con ID:", nuevoMedicoRef.key);
      return { success: true, id: nuevoMedicoRef.key };
    } catch (error) {
      console.error("❌ Error en RTDB (Medico):", error);
      throw error;
    }
  },

  // 3. SINCRONIZACIÓN INICIAL (Traer todo de RTDB a Local)
  syncFromFirebase: async () => {
    try {
      console.log("🔄 Sincronizando desde Realtime Database...");
      const dbRef = ref(db);
      
      // Obtener Pacientes
      const snapshotPacientes = await get(child(dbRef, `pacientes`));
      let listaPacientes: any[] = [];
      if (snapshotPacientes.exists()) {
        const data = snapshotPacientes.val();
        listaPacientes = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      }
      await AsyncStorage.setItem('@pacientes_local', JSON.stringify(listaPacientes));

      // Obtener Médicos
      const snapshotMedicos = await get(child(dbRef, `medicos`));
      let listaMedicos: any[] = [];
      if (snapshotMedicos.exists()) {
        const data = snapshotMedicos.val();
        listaMedicos = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      }
      await AsyncStorage.setItem('@medicos_local', JSON.stringify(listaMedicos));

      return { listaPacientes, listaMedicos };
    } catch (error) {
      console.error("❌ Error en sincronización RTDB:", error);
      return { listaPacientes: [], listaMedicos: [] };
    }
  },

  // 4. OBTENER DATOS LOCALES
  getLocalData: async () => {
    const pacientesRaw = await AsyncStorage.getItem('@pacientes_local');
    const medicosRaw = await AsyncStorage.getItem('@medicos_local');
    return {
      pacientes: pacientesRaw ? JSON.parse(pacientesRaw) : [],
      medicos: medicosRaw ? JSON.parse(medicosRaw) : []
    };
  },

  getPacientes: async () => {
    try {
      // Priorizamos datos locales para mayor velocidad en el Picker
      const locales = await AsyncStorage.getItem('@pacientes_local');
      if (locales) return JSON.parse(locales);

      // Si no hay locales, traemos de Firebase
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, 'pacientes'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const lista = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        await AsyncStorage.setItem('@pacientes_local', JSON.stringify(lista));
        return lista;
      }
      return [];
    } catch (error) {
      console.error("❌ Error al obtener pacientes:", error);
      return [];
    }
  },

  // GUARDAR RESULTADO DE PRUEBA (Vinculación con Paciente)
  // Este método es el que usarán tus compañeros de equipo al finalizar cada evaluación
  savePruebaResult: async (pacienteId: string, pruebaNombre: string, puntaje: number, detalles: any = {}) => {
    try {
      const resultadosRef = ref(db, 'resultados_pruebas');
      const nuevoResultadoRef = push(resultadosRef);

      const dataFinal = {
        pacienteId, // Vínculo esencial para el historial
        pruebaNombre,
        puntaje,
        detalles,
        timestamp: new Date().toISOString()
      };

      // Guardar en Firebase RTDB
      await set(nuevoResultadoRef, dataFinal);

      // Actualizar historial local (AsyncStorage)
      const locales = await AsyncStorage.getItem('@resultados_local');
      const lista = locales ? JSON.parse(locales) : [];
      lista.push({ ...dataFinal, id: nuevoResultadoRef.key });
      await AsyncStorage.setItem('@resultados_local', JSON.stringify(lista));

      console.log(`✅ Resultado de ${pruebaNombre} guardado para paciente:`, pacienteId);
      return { success: true, id: nuevoResultadoRef.key };
    } catch (error) {
      console.error("❌ Error al guardar resultado de prueba:", error);
      throw error;
    }
  },

  // En SyncService.ts
  getPacientesParaMenu: async () => {
    const locales = await AsyncStorage.getItem('@pacientes_local');
    return locales ? JSON.parse(locales) : [];
  }
};