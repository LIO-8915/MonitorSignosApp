import * as SQLite from 'expo-sqlite';

//////// --- INTERFACES --- ////////

export interface Paciente {
  id: string;         // ID único (Firebase Key o Timestamp)
  pacienteId: string; // ID Manual (Cédula o Código Interno)
  nombre: string;
  apellido: string;
  edad: string;
  peso: string;
  estatura: string;
}

export interface SignosVitales {
  id?: number;
  pacienteId: string; // Debe coincidir con el ID del paciente seleccionado
  fecha: string;
  bpm: number;
  temperatura: number;
  spo2: number;
}

// --- CONFIGURACIÓN DE LA BASE DE DATOS --- //
const db = SQLite.openDatabaseSync('geriatricApp.db');

/**
 * Inicializa las tablas necesarias para el funcionamiento local.
 */
export const setupDatabase = async () => {
  try {
    // Tabla de Pacientes (Espejo local)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pacientes (
        id TEXT PRIMARY KEY NOT NULL,
        pacienteId TEXT,
        nombre TEXT,
        apellido TEXT,
        edad TEXT,
        peso TEXT,
        estatura TEXT
      );
    `);

    // Tabla de Seguimiento Vital
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS seguimiento_vital (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pacienteId TEXT NOT NULL,
        fecha TEXT NOT NULL,
        bpm REAL,
        temperatura REAL,
        spo2 REAL
      );
    `);

    // Tabla de Bitácora de movimientos
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS bitacora (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT,
        hora TEXT,
        usuario TEXT,
        movimiento TEXT
      );
    `);

    console.log("✅ Base de datos SQLite inicializada correctamente.");
  } catch (error) {
    console.error("❌ Error al inicializar la base de datos:", error);
  }
};

//////// --- OPERACIONES DE PACIENTES --- ////////

export const getAllPacientes = async (): Promise<Paciente[]> => {
  try {
    const result = await db.getAllAsync<Paciente>('SELECT * FROM pacientes ORDER BY nombre ASC');
    return result;
  } catch (error) {
    console.error("Error al obtener pacientes:", error);
    return [];
  }
};

export const savePacienteLocal = async (p: Paciente) => {
  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO pacientes (id, pacienteId, nombre, apellido, edad, peso, estatura) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [p.id, p.pacienteId, p.nombre, p.apellido, p.edad, p.peso, p.estatura]
    );
    return { success: true };
  } catch (error) {
    console.error("Error al guardar paciente local:", error);
    return { success: false };
  }
};

//////// --- OPERACIONES DE SIGNOS VITALES --- ////////

/**
 * Guarda una nueva medición de signos vitales.
 * @param medicion Objeto con los datos del paciente y sus signos.
 */
export const saveMedicionVital = async (medicion: SignosVitales) => {
  try {
    await db.runAsync(
      `INSERT INTO seguimiento_vital (pacienteId, fecha, bpm, temperatura, spo2) VALUES (?, ?, ?, ?, ?)`,
      [
        medicion.pacienteId, 
        medicion.fecha, 
        medicion.bpm, 
        medicion.temperatura, 
        medicion.spo2
      ]
    );
    return { success: true };
  } catch (error) {
    console.error("❌ Error al guardar signos vitales en SQLite:", error);
    return { success: false, error };
  }
};

/**
 * Obtiene el historial de signos de un paciente específico.
 */
export const getSignosByPaciente = async (pacienteId: string): Promise<SignosVitales[]> => {
  try {
    return await db.getAllAsync<SignosVitales>(
      'SELECT * FROM seguimiento_vital WHERE pacienteId = ? ORDER BY fecha ASC',
      [pacienteId]
    );
  } catch (error) {
    console.error("Error al consultar signos:", error);
    return [];
  }
};

//////// --- OPERACIÓN DE BITÁCORA --- ////////

export const registrarEnBitacora = async (mov: string, usuario: string = 'Admin') => {
  try {
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString();
    const hora = ahora.toLocaleTimeString();
    
    await db.runAsync(
      'INSERT INTO bitacora (fecha, hora, usuario, movimiento) VALUES (?, ?, ?, ?)',
      [fecha, hora, usuario, mov]
    );
  } catch (error) {
    console.error("Error en bitácora:", error);
  }
};