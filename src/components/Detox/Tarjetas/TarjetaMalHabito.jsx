// src/components/Detox/Tarjetas/TarjetaMalHabito.jsx
import React from 'react';
import ContadorSupervivencia from './ContadorSupervivencia';
import MetricaAhorro from './MetricaAhorro';
import BotonSOS from '../Botones/BotonSOS';
import BotonRecaida from '../Botones/BotonRecaida';
import { Trash2 } from 'lucide-react'; // <-- NUEVO: Importamos el icono de papelera
import styles from './TarjetaMalHabito.module.css';

// NUEVO: Agregamos onEliminar a las propiedades que recibe la tarjeta
export default function TarjetaMalHabito({ habito, onSOSClick, onRecaidaConfirm, onEliminar, isDarkMode }) {
  // NUEVO: Desestructuramos también el 'id' del hábito para poder borrarlo
  const { id, nombre, fecha_inicio_limpio, costo_diario } = habito;

  return (
    <div className={`${styles.tarjeta} ${isDarkMode ? styles.dark : ''}`}>
      
      {/* TÍTULO DEL HÁBITO Y BOTÓN DE BORRAR */}
      <div className={styles.header}>
        <h3 className={styles.nombreHabito}>{nombre}</h3>
        
        {/* NUEVO: El botón de eliminar */}
        <button 
          className={styles.btnEliminar} 
          onClick={() => onEliminar(id)}
          title="Eliminar reto"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className={styles.metricasWrapper}>
        <ContadorSupervivencia fechaInicio={fecha_inicio_limpio} isDarkMode={isDarkMode} />
        {costo_diario > 0 && (
          <MetricaAhorro fechaInicio={fecha_inicio_limpio} costoDiario={costo_diario} isDarkMode={isDarkMode} />
        )}
      </div>

      <div className={styles.accionesWrapper}>
        <BotonSOS onClick={() => onSOSClick(habito)} />
        <div className={styles.recaidaWrapper}>
          <BotonRecaida onRecaidaConfirm={() => onRecaidaConfirm(habito)} />
        </div>
      </div>
      
    </div>
  );
}
