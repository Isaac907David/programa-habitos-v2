import React from 'react';
import { Target } from 'lucide-react';
import styles from './InputNombre.module.css';

export default function InputNombre({ nombre, setNombre, isDarkMode, guardando }) {
  return (
    <div className={styles.inputGroup}>
      <label className={`${styles.label} ${isDarkMode ? styles.labelDark : styles.labelLight}`}>
        <Target size={18} className={styles.iconAccent}/> Nombre del Hábito
      </label>
      <input 
        className={`${styles.input} ${isDarkMode ? styles.inputDark : styles.inputLight}`}
        type="text" 
        placeholder="Ej. Leer 20 páginas, Meditar..." 
        value={nombre} 
        onChange={(e) => setNombre(e.target.value)} 
        disabled={guardando}
      />
    </div>
  );
}