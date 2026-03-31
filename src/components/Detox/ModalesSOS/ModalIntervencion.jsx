// src/components/Detox/ModalesSOS/ModalIntervencion.jsx
import React, { useState } from 'react';
import SelectorEmocion from './SelectorEmocion';
import TarjetaRespuestaIA from './TarjetaRespuestaIA';
import { generarConsejoIA } from '../../../services/coachPromptAI';
import { guardarRegistroSOS } from '../../../services/detoxSupabase';
import { X } from 'lucide-react';
import styles from './ModalIntervencion.module.css';

// RECIBIMOS isDarkMode y se lo pasamos a los hijos
export default function ModalIntervencion({ habito, usuarioId, onClose, isDarkMode }) {
  const [fase, setFase] = useState('seleccion'); 
  const [respuestaIA, setRespuestaIA] = useState('');

  const handleEmocionSeleccionada = async (emocion) => {
    setFase('cargando');
    const ahora = new Date();
    const inicio = new Date(habito.fecha_inicio_limpio);
    const diasLimpio = Math.floor((ahora - inicio) / (1000 * 60 * 60 * 24));
    const ahorros = diasLimpio * habito.costo_diario;

    const consejo = await generarConsejoIA(habito.nombre, diasLimpio, emocion, ahorros);
    
    await guardarRegistroSOS(usuarioId, habito.id, emocion, consejo);
    setRespuestaIA(consejo);
    setFase('respuesta');
  };

  return (
    <div className={`${styles.overlay} ${isDarkMode ? styles.darkOverlay : ''}`}>
      <div className={`${styles.modal} ${isDarkMode ? styles.dark : ''}`}>
        <button className={styles.btnCerrar} onClick={onClose}><X size={24}/></button>
        
        {fase === 'seleccion' && <SelectorEmocion onSelect={handleEmocionSeleccionada} isDarkMode={isDarkMode} />}
        
        {(fase === 'cargando' || fase === 'respuesta') && (
          <TarjetaRespuestaIA 
            cargando={fase === 'cargando'} 
            respuesta={respuestaIA} 
            onClose={onClose} 
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
}