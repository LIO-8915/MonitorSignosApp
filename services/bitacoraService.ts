import { push, ref, set } from 'firebase/database';
import { db } from './firebase';

export const registrarBitacora = async (
  pacienteId: string,
  movimiento: string,
  detalles: string = ''
) => {
  try {
    const ahora = new Date();
    const fechaStr = ahora.toLocaleDateString('es-MX');
    const horaStr = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const usuario = 'Admin_Gediatric'; // Si tienes autenticación, usa el usuario logueado

    const bitacoraRef = ref(db, 'bitacora');
    const nuevaEntradaRef = push(bitacoraRef);
    await set(nuevaEntradaRef, {
      pacienteId,
      fecha: fechaStr,
      hora: horaStr,
      usuario,
      movimiento,
      detalles,
      timestamp: ahora.toISOString()
    });
    console.log('✅ Bitácora registrada');
  } catch (error) {
    console.error('❌ Error al registrar en bitácora:', error);
  }
};