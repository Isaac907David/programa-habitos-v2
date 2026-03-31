// src/components/Detox/Botones/BotonSOS.jsx
import React from 'react';
import { ShieldAlert } from 'lucide-react';
import styles from './BotonSOS.module.css';

export default function BotonSOS({ onClick }) {
  return (
    <button className={styles.boton} onClick={onClick}>
      <ShieldAlert size={18} className={styles.icono} />
      <span>Tengo ganas de recaer</span>
    </button>
  );
}