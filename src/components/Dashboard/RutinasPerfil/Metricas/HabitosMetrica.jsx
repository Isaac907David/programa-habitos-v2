import React from 'react';
import { Target } from 'lucide-react';
import styles from './HabitosMetrica.module.css';

export default function HabitosMetrica({ valor }) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>Hábitos</span>
      <div className={styles.valueWrapper}>
        <Target className={styles.icon} size={20} />
        <span className={styles.number}>{valor}</span>
      </div>
    </div>
  );
}