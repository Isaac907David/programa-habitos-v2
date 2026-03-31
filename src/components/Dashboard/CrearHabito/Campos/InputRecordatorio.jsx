// src/components/Dashboard/CrearHabito/Campos/InputRecordatorio.jsx
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import styles from './InputRecordatorio.module.css';
import SelectorRecordatorioModal from './SelectorRecordatorioModal.jsx';

export default function InputRecordatorio({ recordatorio, setRecordatorio, isDarkMode, guardando }) {
  const [modalAbierto, setModalAbierto] = useState(false);

  // Función traductora para mostrar 24h como 12h en la pantalla
  const formatearA12Horas = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${String(hour).padStart(2, '0')}:${m} ${ampm}`;
  };

  const estaVacio = !recordatorio;
  const textoAMostrar = estaVacio ? '--:--' : formatearA12Horas(recordatorio);

  // 🧹 SACAMOS LA LÓGICA AFUERA PARA QUE VS CODE NO SE CONFUNDA
  const inputClass = `${styles.input} ${isDarkMode ? styles.inputDark : styles.inputLight} ${guardando ? styles.disabled : ''}`;
  
  const inputStyle = { 
    cursor: 'pointer', 
    textAlign: 'center', 
    fontSize: '1.2rem', 
    fontWeight: estaVacio ? '400' : '600',
    color: estaVacio 
            ? (isDarkMode ? '#64748b' : '#94a3b8') 
            : (isDarkMode ? '#f8fafc' : '#0f172a')
  };

  return (
    <>
      <label className={`${styles.label} ${isDarkMode ? styles.labelDark : styles.labelLight}`}>
        <Bell size={18} className={styles.iconAccent}/> Recordatorio
      </label>
      
      {/* Ahora el JSX queda súper limpio y a prueba de errores */}
      <div 
        className={inputClass}
        onClick={() => !guardando && setModalAbierto(true)}
        style={inputStyle}
      >
        {textoAMostrar}
      </div>

      <SelectorRecordatorioModal 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        onSave={(nuevoTiempo) => {
            setRecordatorio(nuevoTiempo);
            setModalAbierto(false);
        }} 
        tiempoActual={recordatorio} 
        isDarkMode={isDarkMode} 
      />
    </>
  );
}