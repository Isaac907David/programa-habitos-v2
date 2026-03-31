import React from 'react';
import { Award } from 'lucide-react';
import styles from './NivelMetrica.module.css';

export default function NivelMetrica({ valor }) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>Disciplina</span>
      <div className={styles.valueWrapper}>
        <Award className={styles.icon} size={20} />
        <span className={styles.number}>Lvl {valor}</span>
      </div>
    </div>
  );
}