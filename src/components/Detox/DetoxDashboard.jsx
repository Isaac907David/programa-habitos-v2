// src/components/Detox/DetoxDashboard.jsx
import React, { useState, useEffect } from 'react';
import TarjetaMalHabito from './Tarjetas/TarjetaMalHabito';
import ModalIntervencion from './ModalesSOS/ModalIntervencion'; 
import ModalNuevoDetox from './ModalesSOS/ModalNuevoDetox';
import { PlusCircle } from 'lucide-react';
import styles from './DetoxDashboard.module.css';

// CORRECCIÓN: Solo una importación de Supabase, limpia y completa
import { obtenerMalosHabitos, crearMalHabito, registrarRecaida, eliminarMalHabito } from '../../services/detoxSupabase';

export default function DetoxDashboard({ usuario, isDarkMode }) {
  const [habitos, setHabitos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [modalSOSAbierto, setModalSOSAbierto] = useState(false);
  const [habitoEnCrisis, setHabitoEnCrisis] = useState(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

  useEffect(() => {
    if (!usuario?.id) return;
    const cargarDatos = async () => {
      setCargando(true);
      const datos = await obtenerMalosHabitos(usuario.id);
      setHabitos(datos);
      setCargando(false);
    };
    cargarDatos();
  }, [usuario]);

  const abrirModalCrear = () => setModalCrearAbierto(true);

  const guardarNuevoHabito = async (nombre, costo) => {
    const nuevoHabito = await crearMalHabito(usuario.id, nombre, costo);
    if (nuevoHabito) {
      setHabitos([nuevoHabito, ...habitos]);
      setModalCrearAbierto(false);
    }
  };

  const handleRecaida = async (habito) => {
    const ahora = new Date();
    const inicio = new Date(habito.fecha_inicio_limpio);
    const diasLimpio = Math.floor((ahora - inicio) / (1000 * 60 * 60 * 24));
    const nuevoRecord = diasLimpio > habito.record_dias ? diasLimpio : habito.record_dias;

    const habitoActualizado = await registrarRecaida(habito.id, nuevoRecord);
    if (habitoActualizado) {
      setHabitos(habitos.map(h => h.id === habitoActualizado.id ? habitoActualizado : h));
      alert("Recaída registrada. El contador ha vuelto a cero. ¡No te rindas, vuelve a empezar!");
    }
  };

  const handleSOS = (habito) => {
    setHabitoEnCrisis(habito);
    setModalSOSAbierto(true);
  };

  // 5. MANEJAR LA ELIMINACIÓN
  const handleEliminar = async (habitoId) => {
    // Pedimos confirmación para evitar borrados accidentales
    const confirmar = window.confirm("¿Estás seguro de que quieres eliminar este reto? Perderás todo el progreso y ahorros registrados.");
    
    if (confirmar) {
      const exito = await eliminarMalHabito(habitoId);
      if (exito) {
        // Si se borró en la BD, lo sacamos de la pantalla actualizando el estado
        setHabitos(habitos.filter(h => h.id !== habitoId));
      } else {
        alert("Hubo un problema al eliminar el reto. Intenta de nuevo.");
      }
    }
  };

  if (cargando) return <div className={`${styles.cargando} ${isDarkMode ? styles.darkText : ''}`}>Cargando tu Modo Detox...</div>;

  return (
    <div className={`${styles.dashboardContainer} ${isDarkMode ? styles.dark : ''}`}>
      <div className={styles.cabecera}>
        <div>
          <h1 className={styles.titulo}>Modo Detox</h1>
          <p className={styles.subtitulo}>Rompe tus cadenas. Un segundo a la vez.</p>
        </div>
        <button className={styles.btnAgregar} onClick={abrirModalCrear}>
          <PlusCircle size={20} />
          <span>Nuevo Reto</span>
        </button>
      </div>

      {habitos.length === 0 ? (
        <div className={styles.estadoVacio}>
          <h3>Aún no estás combatiendo ningún mal hábito</h3>
          <p>Haz clic en "Nuevo Reto" para empezar a limpiar tu vida.</p>
        </div>
      ) : (
        <div className={styles.gridTarjetas}>
          {habitos.map((habito) => (
            <TarjetaMalHabito 
              key={habito.id} 
              habito={habito} 
              onSOSClick={handleSOS}
              onRecaidaConfirm={handleRecaida}
              onEliminar={handleEliminar} // <-- CORRECCIÓN: Ahora sí pasamos la función de eliminar
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      )}

      {modalSOSAbierto && habitoEnCrisis && (
        <ModalIntervencion 
          habito={habitoEnCrisis}
          usuarioId={usuario?.id}
          onClose={() => { setModalSOSAbierto(false); setHabitoEnCrisis(null); }}
          isDarkMode={isDarkMode} 
        />
      )}

      <ModalNuevoDetox 
        isOpen={modalCrearAbierto} 
        onClose={() => setModalCrearAbierto(false)} 
        onGuardar={guardarNuevoHabito} 
        isDarkMode={isDarkMode} 
      />
    </div>
  );
}