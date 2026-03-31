// src/components/Detox/ModalesSOS/TarjetaRespuestaIA.jsx
import React from 'react';
import { BrainCircuit } from 'lucide-react';
import styles from './TarjetaRespuestaIA.module.css';

export default function TarjetaRespuestaIA({ cargando, respuesta, onClose, isDarkMode }) {
  return (
    <div className={`${styles.contenedor} ${isDarkMode ? styles.dark : ''}`}>
      <div className={styles.header}>
        <BrainCircuit size={32} className={styles.icono} />
        <h3 className={styles.titulo}>Coach Cognitivo</h3>
      </div>

      <div className={styles.cuerpo}>
        {cargando ? (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <p>Analizando tu situación y buscando la mejor estrategia...</p>
          </div>
        ) : (
          <div className={styles.resultado}>
            <p className={styles.textoIA}>{respuesta}</p>
            <button className={styles.btnExito} onClick={onClose}>
              Entendido, me mantendré fuerte
            </button>
          </div>
        )}
      </div>
    </div>
  );
}