// src/components/Detox/Tarjetas/ContadorSupervivencia.jsx
import React, { useState, useEffect } from 'react';
import styles from './ContadorSupervivencia.module.css';

// AÑADIDO: Recibimos isDarkMode
export default function ContadorSupervivencia({ fechaInicio, isDarkMode }) {
  const [tiempo, setTiempo] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

  useEffect(() => {
    if (!fechaInicio) return;

    const calcularTiempo = () => {
      const ahora = new Date();
      const inicio = new Date(fechaInicio);
      const diferencia = ahora - inicio;

      if (diferencia < 0) return;

      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
      const minutos = Math.floor((diferencia / 1000 / 60) % 60);
      const segundos = Math.floor((diferencia / 1000) % 60);

      setTiempo({ dias, horas, minutos, segundos });
    };

    calcularTiempo();
    const intervalo = setInterval(calcularTiempo, 1000);

    return () => clearInterval(intervalo);
  }, [fechaInicio]);

  const formatear = (num) => num.toString().padStart(2, '0');

  return (
    // AÑADIDO: Clase dinámica para el modo oscuro
    <div className={`${styles.contenedor} ${isDarkMode ? styles.dark : ''}`}>
      
      <div className={styles.diasWrapper}>
        <span className={styles.numeroGigante}>{tiempo.dias}</span>
        <span className={styles.labelDias}>Días Limpio</span>
      </div>

      <div className={styles.relojWrapper}>
        <div className={styles.unidad}>
          <span className={styles.numeroPeque}>{formatear(tiempo.horas)}</span>
          <span className={styles.labelPeque}>hrs</span>
        </div>
        
        <span className={styles.separador}>:</span>
        
        <div className={styles.unidad}>
          <span className={styles.numeroPeque}>{formatear(tiempo.minutos)}</span>
          <span className={styles.labelPeque}>min</span>
        </div>
        
        <span className={styles.separador}>:</span>
        
        <div className={styles.unidad}>
          <span className={styles.numeroPeque}>{formatear(tiempo.segundos)}</span>
          <span className={styles.labelPeque}>seg</span>
        </div>
      </div>
      
    </div>
  );
}