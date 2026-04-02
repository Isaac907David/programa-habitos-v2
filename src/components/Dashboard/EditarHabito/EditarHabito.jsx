// src/components/Dashboard/EditarHabito/EditarHabito.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase'; 
import toast from 'react-hot-toast'; 
import { Save } from 'lucide-react';

// 👇 ESTA ES LA LÍNEA CLAVE CORREGIDA 👇
// Ahora apuntamos a su propio archivo CSS para que cargue los botones premium
import styles from './EditarHabito.module.css'; 

// ♻️ ¡RECICLAMOS NUESTROS COMPONENTES MÁGICOS!
import InputNombre from '../CrearHabito/Campos/InputNombre';
import InputMeta from '../CrearHabito/Campos/InputMeta';
import InputRecordatorio from '../CrearHabito/Campos/InputRecordatorio';
import SelectorDias from '../CrearHabito/Campos/SelectorDias';

function EditarHabito({ isDarkMode, habito, onActualizar, volver }) {
  const [nombre, setNombre] = useState('');
  const [tiempoObjetivo, setTiempoObjetivo] = useState('');
  const [recordatorio, setRecordatorio] = useState('');
  const [dias, setDias] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // 1. CARGAMOS LOS DATOS DEL HÁBITO CUANDO SE ABRE LA PANTALLA
  useEffect(() => {
    if (habito) {
      setNombre(habito.nombre);
      setRecordatorio(habito.recordatorio || '');
      setDias(habito.dias || []);

      // TRADUCTOR INVERSO: De segundos de la base de datos -> a HH:MM:SS para la ruleta
      const segundosTotales = habito.tiempo_objetivo || habito.tiempoObjetivo || 0;
      const h = Math.floor(segundosTotales / 3600);
      const m = Math.floor((segundosTotales % 3600) / 60);
      const s = segundosTotales % 60;
      
      const formatoRuleta = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      setTiempoObjetivo(formatoRuleta);
    }
  }, [habito]);

  const toggleDia = (dia) => {
    if (dias.includes(dia)) setDias(dias.filter(d => d !== dia));
    else setDias([...dias, dia]);
  };

  const handleTimeChange = (e) => {
    // Esta función la pide InputMeta, aunque la ruleta ya le pasa el formato correcto
    setTiempoObjetivo(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nombre || dias.length === 0 || tiempoObjetivo.length < 8) {
      toast.error("Por favor completa todos los campos correctamente.");
      return;
    }
    
    setGuardando(true);

    try {
      // TRADUCTOR DE IDA: De HH:MM:SS de la ruleta -> a segundos para la base de datos
      const partesTiempo = tiempoObjetivo.split(':');
      const totalSegundos = (parseInt(partesTiempo[0]) * 3600) + (parseInt(partesTiempo[1]) * 60) + parseInt(partesTiempo[2]);

      if (totalSegundos === 0) {
        toast.error("La meta debe ser mayor a cero.");
        setGuardando(false);
        return;
      }

      const datosActualizados = {
        nombre: nombre,
        tiempo_objetivo: totalSegundos,
        recordatorio: recordatorio || null,
        dias: dias
      };

      const { error } = await supabase
        .from('habitos')
        .update(datosActualizados)
        .eq('id', habito.id);

      if (error) throw error;

      toast.success("¡Hábito actualizado con éxito! ✏️");
      onActualizar(); // Le avisamos al Dashboard que recargue
      
    } catch (error) {
      toast.error("Error al actualizar: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={`${styles.card} ${isDarkMode ? styles.cardDark : styles.cardLight}`}>
      <div className={styles.headerForm}>
        <h2 className={styles.title}>Editar Hábito</h2>
        <p className={styles.subtitle}>Modifica tu meta o los días de compromiso</p>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        
        {/* Usamos exactamente los mismos componentes de Crear Habito */}
        <InputNombre nombre={nombre} setNombre={setNombre} isDarkMode={isDarkMode} guardando={guardando} />
        
        <div className={styles.row}>
          <div className={styles.col}>
            <InputMeta tiempoObjetivo={tiempoObjetivo} handleTimeChange={handleTimeChange} isDarkMode={isDarkMode} guardando={guardando} />
          </div>
          <div className={styles.col}>
            <InputRecordatorio recordatorio={recordatorio} setRecordatorio={setRecordatorio} isDarkMode={isDarkMode} guardando={guardando} />
          </div>
        </div>

        <SelectorDias dias={dias} toggleDia={toggleDia} isDarkMode={isDarkMode} guardando={guardando} />
        
        {/* Botones de acción manuales (para cambiar el texto a "Actualizar") */}
        <div className={styles.botonesContainer}>
          <button type="button" className={`${styles.btnCancelar} ${isDarkMode ? styles.btnCancelarDark : styles.btnCancelarLight}`} onClick={volver} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" className={styles.btnGuardar} disabled={guardando}>
            <Save size={20}/> {guardando ? 'Actualizando...' : 'Actualizar Hábito'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default EditarHabito;