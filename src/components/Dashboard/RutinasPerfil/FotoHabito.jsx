import React, { useState, useRef } from 'react';
import { Target } from 'lucide-react'; // El ícono más parecido al de tu captura
import styles from './FotoHabito.module.css';

export default function FotoHabito({ evidencia }) {
  const [isPressed, setIsPressed] = useState(false);
  const pressTimer = useRef(null);

  // --- LÓGICA DE PULSACIÓN LARGA (3D TOUCH) ---
  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => {
      setIsPressed(true);
      // Pequeña vibración en móviles si el navegador lo soporta
      if (navigator.vibrate) navigator.vibrate(50); 
    }, 400); // 400 milisegundos para considerarlo pulsación larga
  };

  const handlePressEnd = () => {
    clearTimeout(pressTimer.current);
    setIsPressed(false);
  };

  return (
    <>
      {/* MINIATURA EN LA CUADRÍCULA */}
      <div 
        className={styles.gridItem}
        onTouchStart={handlePressStart} 
        onTouchEnd={handlePressEnd} 
        onTouchMove={handlePressEnd}
        onMouseDown={handlePressStart} 
        onMouseUp={handlePressEnd} 
        onMouseLeave={handlePressEnd}
        onContextMenu={(e) => e.preventDefault()} // Evita que salga el menú de guardar imagen del navegador
      >
        <img src={evidencia.evidencia_url} alt="Victoria" className={styles.gridImage} />
        <div className={styles.captionSutil}>{evidencia.habitos?.nombre}</div>
      </div>

      {/* OVERLAY DE PREVISUALIZACIÓN (TU CAPTURA) */}
      {isPressed && (
        <div className={styles.overlayBlur}>
          <div className={styles.previewContainer}>
            <img src={evidencia.evidencia_url} alt="Zoom" className={styles.previewImage} />
            
            {/* La píldora negra de la esquina inferior izquierda */}
            <div className={styles.badgePildora}>
              <Target size={16} /> 
              <span>{evidencia.habitos?.nombre || 'Victoria'}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}