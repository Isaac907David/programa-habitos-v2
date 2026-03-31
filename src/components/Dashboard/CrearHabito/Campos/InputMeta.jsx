// src/components/Dashboard/CrearHabito/Campos/InputMeta.jsx
import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import styles from './InputMeta.module.css';
import SelectorTiempoModal from './SelectorTiempoModal'; 

export default function InputMeta({ tiempoObjetivo, handleTimeChange, isDarkMode, guardando }) {
  const [modalAbierto, setModalAbierto] = useState(false);

  const guardarTiempo = (nuevoTiempo) => {
    handleTimeChange({ target: { value: nuevoTiempo.replace(/:/g, '') } });
    setModalAbierto(false);
  };

  // 🎨 LÓGICA DE PLACEHOLDER: Si no hay nada seleccionado, mostramos el ejemplo
  const estaVacio = !tiempoObjetivo;
  const textoAMostrar = estaVacio ? '01:30:00' : tiempoObjetivo;

  return (
    <>
      <label className={`${styles.label} ${isDarkMode ? styles.labelDark : styles.labelLight}`}>
        <Clock size={18} className={styles.iconAccent}/> Meta (HH:MM:SS)
      </label>
      
      <div 
        className={`${styles.input} ${isDarkMode ? styles.inputDark : styles.inputLight} ${guardando ? styles.disabled : ''}`}
        onClick={() => !guardando && setModalAbierto(true)}
        style={{ 
          cursor: 'pointer', 
          textAlign: 'center', 
          fontSize: '1.2rem', 
          // Si está vacío, le bajamos el peso a la fuente y le ponemos color tenue
          fontWeight: estaVacio ? '400' : '600',
          color: estaVacio 
                  ? (isDarkMode ? '#64748b' : '#94a3b8') // Color transparente/placeholder
                  : (isDarkMode ? '#f8fafc' : '#0f172a') // Color sólido de texto escrito
        }}
      >
        {textoAMostrar}
      </div>

      <SelectorTiempoModal 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        onSave={guardarTiempo} 
        // Si la ruleta se abre y está vacío, la ruleta empieza en 01:30:00 por defecto
        tiempoActual={tiempoObjetivo || '01:30:00'} 
        isDarkMode={isDarkMode} 
      />
    </>
  );
}