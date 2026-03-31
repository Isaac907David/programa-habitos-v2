import React from 'react';
import { Trash2 } from 'lucide-react';
import styles from './BotonEliminar.module.css';

function BotonEliminar({ onClick, borrando }) {
  return (
    <button 
      onClick={onClick}
      disabled={borrando}
      className={styles.btnPeligro}
    >
        <Trash2 size={20} />
        {borrando ? 'Eliminando de la nube...' : 'Eliminar Hábito'}
    </button>
  );
}

export default BotonEliminar;