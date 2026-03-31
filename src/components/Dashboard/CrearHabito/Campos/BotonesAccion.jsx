import React from 'react';
import { Save } from 'lucide-react';
import styles from './BotonesAccion.module.css';

export default function BotonesAccion({ volver, guardando, isDarkMode }) {
  return (
    <div className={styles.botonesContainer}>
      <button 
        type="button" 
        className={`${styles.btnCancelar} ${isDarkMode ? styles.btnCancelarDark : styles.btnCancelarLight}`} 
        onClick={volver} 
        disabled={guardando}
      >
        Cancelar
      </button>
      <button type="submit" className={styles.btnGuardar} disabled={guardando}>
        <Save size={20}/> {guardando ? 'Guardando...' : 'Guardar Hábito'}
      </button>
    </div>
  );
}