// src/components/Detox/ModalesSOS/SelectorEmocion.jsx
import React from 'react';
import styles from './SelectorEmocion.module.css';

export default function SelectorEmocion({ onSelect, isDarkMode }) {
  const emociones = ['Estrés', 'Aburrimiento', 'Presión Social', 'Ansiedad', 'Tristeza'];

  return (
    <div className={`${styles.contenedor} ${isDarkMode ? styles.dark : ''}`}>
      <h3 className={styles.titulo}>Respira profundo.</h3>
      <p className={styles.subtitulo}>¿Qué emoción te está empujando a recaer ahora mismo?</p>
      
      <div className={styles.grid}>
        {emociones.map(emocion => (
          <button 
            key={emocion} 
            className={styles.btnEmocion} 
            onClick={() => onSelect(emocion)}
          >
            {emocion}
          </button>
        ))}
      </div>
    </div>
  );
}