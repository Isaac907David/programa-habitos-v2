// src/components/Detox/ModalesSOS/ModalNuevoDetox.jsx
import React, { useState } from 'react';
import { X, Target, DollarSign } from 'lucide-react';
import styles from './ModalNuevoDetox.module.css';

// RECIBIMOS isDarkMode
export default function ModalNuevoDetox({ isOpen, onClose, onGuardar, isDarkMode }) {
  const [nombre, setNombre] = useState('');
  const [costo, setCosto] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    const costoFinal = parseFloat(costo) || 0;
    onGuardar(nombre, costoFinal);
    setNombre('');
    setCosto('');
  };

  return (
    <div className={`${styles.overlay} ${isDarkMode ? styles.darkOverlay : ''}`}>
      <div className={`${styles.modal} ${isDarkMode ? styles.dark : ''}`}>
        
        <button className={styles.btnCerrar} onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className={styles.titulo}>Nuevo Reto Detox</h2>
        <p className={styles.subtitulo}>¿Qué mal hábito vamos a destruir hoy?</p>

        <form onSubmit={handleSubmit} className={styles.formulario}>
          
          <div className={styles.inputGroup}>
            <label>Nombre del mal hábito</label>
            <div className={styles.inputWrapper}>
              <Target size={18} className={styles.icono} />
              <input 
                type="text" 
                placeholder="Ej: Fumar, Dormir tarde, Azúcar..." 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Costo diario (Opcional)</label>
            <p className={styles.ayuda}>¿Cuánto dinero gastas en esto al día? Déjalo en 0 si no aplica.</p>
            <div className={styles.inputWrapper}>
              <DollarSign size={18} className={styles.icono} />
              <input 
                type="number" 
                step="0.01"
                min="0"
                placeholder="Ej: 5.00" 
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.acciones}>
            <button type="button" className={styles.btnCancelar} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.btnGuardar} disabled={!nombre.trim()}>Comenzar Reto</button>
          </div>

        </form>
      </div>
    </div>
  );
}