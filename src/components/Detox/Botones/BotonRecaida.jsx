// src/components/Detox/Botones/BotonRecaida.jsx
import React, { useState, useRef } from 'react';
import styles from './BotonRecaida.module.css';

// El tiempo que el usuario debe mantener presionado (3 segundos)
const TIEMPO_PRESION = 3000; 

export default function BotonRecaida({ onRecaidaConfirm }) {
  // Estados para manejar el progreso y el texto del botón
  const [presionado, setPresionado] = useState(false);
  const [texto, setTexto] = useState('Registrar Recaída');
  
  // Usamos un useRef para guardar el temporizador y que persista entre renderizados
  const timerRef = useRef(null);

  // Iniciar la cuenta regresiva
  const iniciarPresion = () => {
    setPresionado(true);
    setTexto('Manten presionado por 3s...');
    
    timerRef.current = setTimeout(() => {
      // Si llegamos aquí, es que pasaron los 3 segundos
      onRecaidaConfirm(); // Llamamos a la función que resetea la BD
      cancelarPresion(); // Limpiamos el estado
    }, TIEMPO_PRESION);
  };

  // Cancelar la cuenta regresiva (si el usuario suelta el dedo antes de tiempo)
  const cancelarPresion = () => {
    setPresionado(false);
    setTexto('Registrar Recaída');
    if (timerRef.current) {
      clearTimeout(timerRef.current); // Cancelamos el temporizador
    }
  };

  return (
    <button 
      className={styles.boton}
      // Manejamos eventos de ratón y táctiles
      onMouseDown={iniciarPresion} 
      onMouseUp={cancelarPresion}
      onMouseLeave={cancelarPresion} // Si el ratón sale del botón, también cancelamos
      
      onTouchStart={iniciarPresion}
      onTouchEnd={cancelarPresion}
    >
      <span className={presionado ? styles.textoPresionado : ''}>{texto}</span>
    </button>
  );
}