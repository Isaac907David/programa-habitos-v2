// src/components/Dashboard/CrearHabito/CrearHabito.jsx
import React, { useState } from 'react';
import { supabase } from '../../../supabase'; 
import toast from 'react-hot-toast'; 
import styles from './CrearHabito.module.css';

// Importamos los hijos
import InputNombre from './Campos/InputNombre';
import InputMeta from './Campos/InputMeta';
import InputRecordatorio from './Campos/InputRecordatorio';
import SelectorDias from './Campos/SelectorDias';
import BotonesAccion from './Campos/BotonesAccion';

function CrearHabito({ isDarkMode, agregarHabito, volver }) {
  const [nombre, setNombre] = useState('');
  // 🚀 CAMBIO AQUÍ: Iniciamos vacío para que se active el modo "Placeholder"
  const [tiempoObjetivo, setTiempoObjetivo] = useState(''); 
  const [recordatorio, setRecordatorio] = useState('');
  const [dias, setDias] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const toggleDia = (dia) => {
    if (dias.includes(dia)) setDias(dias.filter(d => d !== dia));
    else setDias([...dias, dia]);
  };

  const handleTimeChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 6) raw = raw.slice(0, 6);
    let formatted = raw;
    if (raw.length > 2) formatted = raw.slice(0, 2) + ':' + raw.slice(2);
    if (raw.length > 4) formatted = formatted.slice(0, 5) + ':' + raw.slice(4);
    setTiempoObjetivo(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Como ahora empieza vacío, esta alerta protegerá que no guarden sin elegir tiempo
    if (!nombre || dias.length === 0 || tiempoObjetivo.length < 8) {
      toast.error("Completa todas las opciones y asegúrate de definir una Meta de tiempo.");
      return;
    }
    setGuardando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay una sesión activa.");

      const partesTiempo = tiempoObjetivo.split(':');
      const totalSegundos = (parseInt(partesTiempo[0]) * 3600) + (parseInt(partesTiempo[1]) * 60) + parseInt(partesTiempo[2]);

      if (totalSegundos === 0) {
        toast.error("La meta debe ser mayor a cero.");
        setGuardando(false);
        return;
      }

      const nuevoHabito = {
        user_id: session.user.id,
        nombre,
        tiempo_objetivo: totalSegundos,
        recordatorio: recordatorio || null,
        dias,
        progreso_total: 0
      };

      const { data, error } = await supabase.from('habitos').insert([nuevoHabito]).select();
      if (error) throw error;

      toast.success("¡Hábito creado con éxito! ⏱️");
      agregarHabito(data[0]); 
      volver();
    } catch (error) {
      toast.error("Error al guardar: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={`${styles.card} ${isDarkMode ? styles.cardDark : styles.cardLight}`}>
      <div className={styles.headerForm}>
        <h2 className={styles.title}>Configurar Nuevo Hábito</h2>
        <p className={styles.subtitle}>Define tu meta y los días de compromiso</p>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.formContainer}>
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
        <BotonesAccion volver={volver} guardando={guardando} isDarkMode={isDarkMode} />
      </form>
    </div>
  );
}

export default CrearHabito;