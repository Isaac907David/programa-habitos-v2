// src/services/detoxSupabase.js
import { supabase } from '../supabase';

// 1. OBTENER TODOS LOS MALOS HÁBITOS DEL USUARIO
export const obtenerMalosHabitos = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('malos_habitos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener malos hábitos:', error.message);
    return []; // Retornamos un array vacío para no romper la UI
  }
};

// 2. CREAR UN NUEVO MAL HÁBITO A ROMPER
export const crearMalHabito = async (userId, nombre, costoDiario) => {
  try {
    const { data, error } = await supabase
      .from('malos_habitos')
      .insert([
        { 
          user_id: userId, 
          nombre: nombre, 
          costo_diario: costoDiario,
          // fecha_inicio_limpio y record_dias se ponen solos por defecto en la BD
        }
      ])
      .select()
      .single(); // Para que devuelva el objeto recién creado y no un array

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al crear mal hábito:', error.message);
    return null;
  }
};

// 3. REGISTRAR UNA RECAÍDA (Reiniciar el contador y actualizar récord si aplica)
export const registrarRecaida = async (habitoId, nuevoRecordDias) => {
  try {
    const { data, error } = await supabase
      .from('malos_habitos')
      .update({ 
        fecha_inicio_limpio: new Date().toISOString(), // Reinicia el contador AHORA
        record_dias: nuevoRecordDias // Actualizamos su récord histórico
      })
      .eq('id', habitoId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al registrar recaída:', error.message);
    return null;
  }
};

// 4. GUARDAR EL REGISTRO DE S.O.S. (La memoria de la IA)
export const guardarRegistroSOS = async (userId, habitoId, emocion, respuestaIA) => {
  try {
    const { data, error } = await supabase
      .from('registros_sos')
      .insert([
        {
          user_id: userId,
          mal_habito_id: habitoId,
          emocion_contexto: emocion,
          respuesta_ia: respuestaIA
        }
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al guardar registro SOS:', error.message);
    return null;
  }
};

// 5. ELIMINAR UN MAL HÁBITO
export const eliminarMalHabito = async (habitoId) => {
  try {
    const { error } = await supabase
      .from('malos_habitos')
      .delete()
      .eq('id', habitoId);

    if (error) throw error;
    return true; // Retornamos true si se borró con éxito
  } catch (error) {
    console.error('Error al eliminar mal hábito:', error.message);
    return false;
  }
};