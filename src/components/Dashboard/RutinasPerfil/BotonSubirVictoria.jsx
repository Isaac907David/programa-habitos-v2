import React from 'react';
import { PlusCircle } from 'lucide-react';
import styles from './BotonSubirVictoria.module.css';

export default function BotonSubirVictoria({ onClick }) {
  return (
    <button className={styles.fabButton} onClick={onClick}>
      <PlusCircle size={24}/> 
      <span>Subir Victoria</span>
    </button>
  );
}