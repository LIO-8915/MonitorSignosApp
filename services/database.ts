import * as SQLite from 'expo-sqlite';

//////// --- INTERFACES ---

export interface Paciente {
  id: string; // ID interno (UUID o Timestamp)
  pacienteId: string; // ID Manual (Cédula/DNI)
  nombre: string;
  apellido: string;
  edad: string;
  peso: string;
  estatura: string;
}

export interface Prueba {
  id: string;
  pacienteId: string;
  numero_prueba: number;
  nombre_prueba: string;
  puntuacion: number;
  puntuacion_maxima: number;
  fecha: string;
}

export interface SignosVitales {
  id?: number;
  pacienteId: string;
  fecha: string;
  bpm: number;
  temperatura: number;
  spo2: number;
}

export interface Bitacora {
  id?: number;
  fecha: string;
  hora: string;
  usuario: string; 
  movimiento: 'CITA' | 'CANCELA' | 'RE-AGENDA' | 'REGISTRO_PACIENTE' | 'PRUEBA_MEDICA' | 'MEDICO_NUEVO';
}

// --- CONFIGURACIÓN ---
const db = SQLite.openDatabaseSync('geriatricApp.db');

/**
 * Inicializa las tablas y aplica parches si faltan columnas.
 */
export const DatabaseService = async (): Promise<void> => {
  try {
    // 1. Tabla de Pacientes
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

    // 2. Tabla de Pruebas
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pruebas (
        id TEXT PRIMARY KEY NOT NULL,
        pacienteId TEXT,
        numero_prueba INTEGER,
        nombre_prueba TEXT,
        puntuacion INTEGER,
        puntuacion_maxima INTEGER,
        fecha TEXT
      );
    `);

    // 3. Tabla de Signos Vitales (Aquí solía faltar pacienteId)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS seguimiento_vital (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pacienteId TEXT,
        fecha TEXT,
        bpm INTEGER,
        temperatura REAL,
        spo2 INTEGER
      );
    `);

    // 4. Tabla de Bitácora
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS bitacora (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT,
        hora TEXT,
        usuario TEXT,
        movimiento TEXT
      );
    `);

    // --- MIGRACIÓN: PARCHE PARA EL ERROR "no such column: pacienteId" ---
    // Intentamos agregar la columna a las tablas existentes por si acaso
    const tablasAParchar = ['seguimiento_vital', 'pruebas'];
    
    for (const tabla of tablasAParchar) {
      try {
        await db.execAsync(`ALTER TABLE ${tabla} ADD COLUMN pacienteId TEXT;`);
        console.log(`✅ Columna pacienteId agregada a ${tabla}`);
      } catch (e) {
        // Si falla es porque la columna ya existe, lo cual es bueno.
      }
    }

    console.log("🚀 SQLite Inicializado correctamente");
  } catch (error) {
    console.error("❌ Error al inicializar base de datos:", error);
  }
};

//////// --- OPERACIONES DE PACIENTES ---

export const savePaciente = async (p: Paciente) => {
  try {
    await db.runAsync(
      'INSERT INTO pacientes (id, pacienteId, nombre, apellido, edad, peso, estatura) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [p.id, p.pacienteId, p.nombre, p.apellido, p.edad, p.peso, p.estatura]
    );
    return { success: true };
  } catch (error) {
    console.error("Error al guardar paciente local:", error);
    return { success: false };
  }
};

export const getAllPacientes = async (): Promise<Paciente[]> => {
  try {
    return await db.getAllAsync('SELECT * FROM pacientes');
  } catch (error) {
    return [];
  }
};

export const deletePaciente = async (id: string) => {
  try {
    await db.runAsync('DELETE FROM pacientes WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

//////// --- OPERACIONES DE PRUEBAS ---

export const savePrueba = async (prueba: Prueba) => {
  try {
    await db.runAsync(
      `INSERT INTO pruebas (id, pacienteId, numero_prueba, nombre_prueba, puntuacion, puntuacion_maxima, fecha) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [prueba.id, prueba.pacienteId, prueba.numero_prueba, prueba.nombre_prueba, prueba.puntuacion, prueba.puntuacion_maxima, prueba.fecha]
    );
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

export const getPruebasByPaciente = async (pacienteIdInternal: string): Promise<Prueba[]> => {
  try {
    return await db.getAllAsync('SELECT * FROM pruebas WHERE pacienteId = ?', [pacienteIdInternal]);
  } catch (error) {
    return [];
  }
};

//////// --- OPERACIONES DE SIGNOS VITALES ---

export const saveMedicionVital = async (medicion: SignosVitales) => {
  try {
    await db.runAsync(
      `INSERT INTO seguimiento_vital (pacienteId, fecha, bpm, temperatura, spo2) VALUES (?, ?, ?, ?, ?)`,
      [medicion.pacienteId, medicion.fecha, medicion.bpm, medicion.temperatura, medicion.spo2]
    );
    return { success: true };
  } catch (error) {
    console.error("Error al guardar signos:", error);
    return { success: false };
  }
};

export const getSignosByPaciente = async (pacienteIdInternal: string): Promise<SignosVitales[]> => {
  try {
    // Esta es la consulta que te estaba dando el error
    return await db.getAllAsync(
      'SELECT * FROM seguimiento_vital WHERE pacienteId = ? ORDER BY fecha ASC', 
      [pacienteIdInternal]
    );
  } catch (error) {
    console.error("Error al consultar signos:", error);
    return [];
  }
};

//////// --- OPERACIÓN DE BITÁCORA ---

export const registrarEnBitacora = async (mov: Omit<Bitacora, 'id'>) => {
  try {
    await db.runAsync(
      'INSERT INTO bitacora (fecha, hora, usuario, movimiento) VALUES (?, ?, ?, ?)',
      [mov.fecha, mov.hora, mov.usuario, mov.movimiento]
    );
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};