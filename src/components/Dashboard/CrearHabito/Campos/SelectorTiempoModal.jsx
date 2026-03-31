import React, { useState, useEffect, useRef } from 'react';
import styles from './SelectorTiempoModal.module.css';

export default function SelectorTiempoModal({ isOpen, onClose, onSave, tiempoActual, isDarkMode }) {
  const [h, setH] = useState(0);
  const [m, setM] = useState(30);
  const [s, setS] = useState(0);

  const refH = useRef(null);
  const refM = useRef(null);
  const refS = useRef(null);

  const horas = Array.from({ length: 24 }, (_, i) => i);
  const sexagesimal = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (isOpen && tiempoActual) {
      // 🐛 AQUÍ ESTABA EL ERROR CORREGIDO: Todo en minúscula y más directo
      const partes = tiempoActual.split(':');
      const horasInit = parseInt(partes[0]) || 0;
      const minInit = parseInt(partes[1]) || 0; 
      const segInit = parseInt(partes[2]) || 0; 
      
      setH(horasInit); setM(minInit); setS(segInit);

      setTimeout(() => {
        if (refH.current) refH.current.scrollTop = horasInit * 50;
        if (refM.current) refM.current.scrollTop = minInit * 50;
        if (refS.current) refS.current.scrollTop = segInit * 50;
      }, 50);
    }
  }, [isOpen, tiempoActual]);

  const handleScroll = (e, tipo) => {
    const index = Math.round(e.target.scrollTop / 50);
    if (tipo === 'h' && index >= 0 && index < 24) setH(index);
    if (tipo === 'm' && index >= 0 && index < 60) setM(index);
    if (tipo === 's' && index >= 0 && index < 60) setS(index);
  };

  const guardar = () => {
    const formato = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    onSave(formato);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${isDarkMode ? styles.modalDark : styles.modalLight}`} onClick={e => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h3>Temporizador</h3>
          <button className={styles.btnGuardar} onClick={guardar}>Listo</button>
        </div>

        <div className={styles.pickerContainer}>
          <div className={`${styles.highlightBar} ${isDarkMode ? styles.highlightDark : styles.highlightLight}`}></div>
          
          <span className={`${styles.separatorLeft} ${isDarkMode ? styles.modalDark : styles.modalLight}`}>:</span>
          <span className={`${styles.separatorRight} ${isDarkMode ? styles.modalDark : styles.modalLight}`}>:</span>

          <div className={styles.column} ref={refH} onScroll={(e) => handleScroll(e, 'h')}>
            <div className={styles.spacer}></div>
            {horas.map(num => (
              <div key={`h-${num}`} className={`${styles.item} ${h === num ? styles.itemActive : styles.itemInactive}`}>
                {String(num).padStart(2, '0')}
              </div>
            ))}
            <div className={styles.spacer}></div>
          </div>

          <div className={styles.column} ref={refM} onScroll={(e) => handleScroll(e, 'm')}>
            <div className={styles.spacer}></div>
            {sexagesimal.map(num => (
              <div key={`m-${num}`} className={`${styles.item} ${m === num ? styles.itemActive : styles.itemInactive}`}>
                {String(num).padStart(2, '0')}
              </div>
            ))}
            <div className={styles.spacer}></div>
          </div>

          <div className={styles.column} ref={refS} onScroll={(e) => handleScroll(e, 's')}>
            <div className={styles.spacer}></div>
            {sexagesimal.map(num => (
              <div key={`s-${num}`} className={`${styles.item} ${s === num ? styles.itemActive : styles.itemInactive}`}>
                {String(num).padStart(2, '0')}
              </div>
            ))}
            <div className={styles.spacer}></div>
          </div>

        </div>
      </div>
    </div>
  );
}