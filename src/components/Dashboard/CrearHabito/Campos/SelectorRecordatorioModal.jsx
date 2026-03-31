// src/components/Dashboard/CrearHabito/Campos/SelectorRecordatorioModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './SelectorRecordatorioModal.module.css';

export default function SelectorRecordatorioModal({ isOpen, onClose, onSave, tiempoActual, isDarkMode }) {
  const [period, setPeriod] = useState('AM');
  const [h, setH] = useState(7); // Hora por defecto: 7
  const [m, setM] = useState(0); // Minuto por defecto: 0

  const refPeriod = useRef(null);
  const refH = useRef(null);
  const refM = useRef(null);

  const periodos = ['AM', 'PM'];
  const horas = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutos = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (isOpen) {
      let initH = 7;
      let initM = 0;
      let initP = 'AM';

      // Si ya hay una alarma guardada (viene en formato 24h, ej "15:30") la pasamos a 12h
      if (tiempoActual) {
        const [parsedH, parsedM] = tiempoActual.split(':').map(Number);
        initM = parsedM || 0;
        
        if (parsedH >= 12) {
          initP = 'PM';
          initH = parsedH > 12 ? parsedH - 12 : 12;
        } else {
          initP = 'AM';
          initH = parsedH === 0 ? 12 : parsedH;
        }
      }
      
      setPeriod(initP); setH(initH); setM(initM);

      // Desplazamos las ruedas a su posición correspondiente
      setTimeout(() => {
        if (refPeriod.current) refPeriod.current.scrollTop = initP === 'AM' ? 0 : 50;
        if (refH.current) refH.current.scrollTop = (initH - 1) * 50;
        if (refM.current) refM.current.scrollTop = initM * 50;
      }, 50);
    }
  }, [isOpen, tiempoActual]);

  const handleScroll = (e, tipo) => {
    const index = Math.round(e.target.scrollTop / 50);
    
    if (tipo === 'period' && index >= 0 && index <= 1) setPeriod(periodos[index]);
    if (tipo === 'h' && index >= 0 && index < 12) setH(horas[index]);
    if (tipo === 'm' && index >= 0 && index < 60) setM(minutos[index]);
  };

  const guardar = () => {
    // Convertimos de vuelta a 24 horas para guardarlo en la base de datos
    let finalH = h;
    if (period === 'PM' && h < 12) finalH += 12;
    if (period === 'AM' && h === 12) finalH = 0;
    
    const formato24 = `${String(finalH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    onSave(formato24);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${isDarkMode ? styles.modalDark : styles.modalLight}`} onClick={e => e.stopPropagation()}>
        
        <div className={styles.header}>
          <h3>Editar alarma</h3>
          <p className={styles.subtitle}>Selecciona la hora de tu recordatorio</p>
          <button className={styles.btnGuardar} onClick={guardar}>Listo</button>
        </div>

        <div className={styles.pickerContainer}>
          <div className={`${styles.highlightBar} ${isDarkMode ? styles.highlightDark : styles.highlightLight}`}></div>
          
          <span className={`${styles.separator} ${isDarkMode ? styles.modalDark : styles.modalLight}`}>:</span>

          {/* Columna AM / PM */}
          <div className={styles.column} ref={refPeriod} onScroll={(e) => handleScroll(e, 'period')}>
            <div className={styles.spacer}></div>
            {periodos.map((p, index) => (
              <div key={`p-${p}`} className={`${styles.item} ${styles.itemText} ${period === p ? styles.itemActive : styles.itemInactive}`}>
                {p}
              </div>
            ))}
            <div className={styles.spacer}></div>
          </div>

          {/* Columna Horas (1-12) */}
          <div className={styles.column} ref={refH} onScroll={(e) => handleScroll(e, 'h')}>
            <div className={styles.spacer}></div>
            {horas.map(num => (
              <div key={`h-${num}`} className={`${styles.item} ${h === num ? styles.itemActive : styles.itemInactive}`}>
                {String(num).padStart(2, '0')}
              </div>
            ))}
            <div className={styles.spacer}></div>
          </div>

          {/* Columna Minutos (00-59) */}
          <div className={styles.column} ref={refM} onScroll={(e) => handleScroll(e, 'm')}>
            <div className={styles.spacer}></div>
            {minutos.map(num => (
              <div key={`m-${num}`} className={`${styles.item} ${m === num ? styles.itemActive : styles.itemInactive}`}>
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