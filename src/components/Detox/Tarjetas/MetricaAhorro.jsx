// src/components/Detox/Tarjetas/MetricaAhorro.jsx
import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import styles from './MetricaAhorro.module.css';

// NUEVO: Agregamos isDarkMode a las propiedades (props)
export default function MetricaAhorro({ fechaInicio, costoDiario, isDarkMode }) {
  const [ahorro, setAhorro] = useState(0);

  useEffect(() => {
    // Si no hay fecha o el costo es 0 (ej: si el hábito no le costaba dinero), no hacemos el cálculo intensivo
    if (!fechaInicio || !costoDiario || costoDiario <= 0) {
      setAhorro(0);
      return;
    }

    const calcularAhorro = () => {
      const ahora = new Date();
      const inicio = new Date(fechaInicio);
      const diferenciaMs = ahora - inicio;

      if (diferenciaMs < 0) return;

      // Calculamos cuántos "días exactos" han pasado (incluyendo decimales)
      const diasPasados = diferenciaMs / (1000 * 60 * 60 * 24);
      
      // Multiplicamos los días decimales por el costo diario
      const ahorroTotal = diasPasados * costoDiario;
      
      setAhorro(ahorroTotal);
    };

    calcularAhorro();
    
    // Actualizamos cada segundo para ver crecer los centavos en vivo
    const intervalo = setInterval(calcularAhorro, 1000);

    return () => clearInterval(intervalo);
  }, [fechaInicio, costoDiario]);

  // Si el usuario no configuró un costo diario para este hábito, no mostramos el componente
  if (!costoDiario || costoDiario <= 0) return null;

  // Formateamos el número a moneda con 2 o 4 decimales para que el movimiento sea visible
  const ahorroFormateado = new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4, // 4 decimales hace que cambie cada segundo
    maximumFractionDigits: 4,
  }).format(ahorro);

  return (
    // NUEVO: Agregamos la clase condicional para el modo oscuro
    <div className={`${styles.contenedor} ${isDarkMode ? styles.dark : ''}`}>
      <div className={styles.iconoWrapper}>
        <TrendingUp size={24} className={styles.icono} />
      </div>
      <div className={styles.infoWrapper}>
        <span className={styles.label}>Dinero Salvado</span>
        <span className={styles.monto}>{ahorroFormateado}</span>
      </div>
    </div>
  );
}