import React from 'react';
import { CalendarDays } from 'lucide-react';
import styles from './SelectorDias.module.css';

export default function SelectorDias({ dias, toggleDia, isDarkMode, guardando }) {
  const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className={styles.inputGroup}>
      <label className={`${styles.label} ${isDarkMode ? styles.labelDark : styles.labelLight}`}>
        <CalendarDays size={18} className={styles.iconAccent}/> Días de la semana
      </label>
      <div className={styles.diasContainer}>
        {diasSemana.map(dia => {
          const isSelected = dias.includes(dia);
          const btnClass = isSelected 
            ? styles.diaBtnActive 
            : (isDarkMode ? styles.diaBtnInactiveDark : styles.diaBtnInactiveLight);

          return (
            <button 
              type="button" 
              key={dia} 
              className={`${styles.diaBtn} ${btnClass}`} 
              onClick={() => toggleDia(dia)}
              disabled={guardando}
            >
              {dia}
            </button>
          );
        })}
      </div>
    </div>
  );
}