import React from 'react';
import { Flame } from 'lucide-react';
import styles from './RachaMetrica.module.css';

export default function RachaMetrica({ valor }) {
  // Lógica inteligente: Si la racha es mayor a 0, le añadimos la animación
  const iconClass = valor > 0 ? `${styles.icon} ${styles.latido}` : styles.icon;

  return (
    <div className={styles.container}>
      <span className={styles.label}>Racha Global</span>
      <div className={styles.valueWrapper}>
        <Flame className={iconClass} size={20} />
        <span className={styles.number}>{valor} Días</span>
      </div>
    </div>
  );
}