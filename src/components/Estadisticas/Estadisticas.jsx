// src/components/Estadisticas/Estadisticas.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Flame, Calendar, Trophy, Edit } from 'lucide-react';
import { supabase } from '../../supabase'; 
import BotonEliminar from './BotonEliminar';
import styles from './Estadisticas.module.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast'; 

import Semanal from './Calendarios/Semanal';
import Mensual from './Calendarios/Mensual';
import Anual from './Calendarios/Anual';

function Estadisticas({ habito, volver, onDelete, onEdit, isDarkMode }) {
  const [borrando, setBorrando] = useState(false);
  const [vistaActiva, setVistaActiva] = useState('semana');
  const [datosTendencia, setDatosTendencia] = useState([]);

  const colorTexto = isDarkMode ? '#94a3b8' : '#64748b';
  const colorLinea = isDarkMode ? '#334155' : '#e2e8f0';

  // ==========================================
  // ⏱️ TRADUCTOR DE SEGUNDOS A TEXTO (EL MISMO DEL DASHBOARD)
  // ==========================================
  const formatearSegundos = (segundosTotales) => {
    if (!segundosTotales) return "0s";
    const h = Math.floor(segundosTotales / 3600);
    const m = Math.floor((segundosTotales % 3600) / 60);
    const s = segundosTotales % 60;

    let resultado = [];
    if (h > 0) resultado.push(`${h}h`);
    if (m > 0) resultado.push(`${m}m`);
    // Solo mostramos segundos si no hay horas ni minutos, o si es muy exacto
    if (s > 0 || resultado.length === 0) resultado.push(`${s}s`);

    return resultado.join(' ');
  };

  useEffect(() => {
    if (habito && habito.id) cargarTendenciaUltimos7Dias();
  }, [habito]);

  const cargarTendenciaUltimos7Dias = async () => {
    try {
      const hoy = new Date();
      const hace7Dias = new Date(hoy);
      hace7Dias.setDate(hoy.getDate() - 6); 

      const strInicio = `${hace7Dias.getFullYear()}-${String(hace7Dias.getMonth() + 1).padStart(2, '0')}-${String(hace7Dias.getDate()).padStart(2, '0')}`;
      const strFin = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

      const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      let molde = [];
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(hace7Dias);
        d.setDate(hace7Dias.getDate() + i);
        molde.push({
          dia: nombresDias[d.getDay()],
          fecha: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
          progreso: 0
        });
      }

      const { data, error } = await supabase
        .from('historial_habitos')
        .select('fecha, progreso_alcanzado')
        .eq('habito_id', habito.id)
        .gte('fecha', strInicio)
        .lte('fecha', strFin);

      if (error) throw error;

      if (data) {
        data.forEach(reg => {
          const idx = molde.findIndex(m => m.fecha === reg.fecha);
          if (idx !== -1) molde[idx].progreso = reg.progreso_alcanzado;
        });
      }

      setDatosTendencia(molde);
    } catch (error) {
      console.error("Error al cargar tendencia:", error);
    }
  };

  const eliminarHabito = async () => {
    const confirmar = window.confirm(`¿Estás completamente seguro de que quieres eliminar "${habito.nombre}"?`);
    if (!confirmar) return;

    setBorrando(true);
    try {
      const { error } = await supabase.from('habitos').delete().eq('id', habito.id);
      if (error) throw error;
      
      toast.success("Hábito eliminado correctamente.", { icon: '🗑️' });
      onDelete(habito.id);
    } catch (error) {
      toast.error("Error al intentar eliminar: " + error.message);
      setBorrando(false);
    }
  };

  if (!habito) return null;

  // Calculamos el tiempo traducido antes de renderizar
  const tiempoTraducido = formatearSegundos(habito?.tiempo_objetivo || habito?.tiempoObjetivo || 0);

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.containerDark : styles.containerLight}`}>
      
      <div className={styles.header}>
        <button onClick={volver} className={styles.btnVolver}>
          <ArrowLeft size={28} />
        </button>
        <h2 className={styles.title}>
            <Activity color="#3b82f6" /> {habito?.nombre || "Hábito"}
        </h2>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${isDarkMode ? styles.statCardDark : styles.statCardLight}`}>
            <Flame color="#ef4444" size={32} />
            <p className={styles.statValue}>{habito?.racha_actual || 0} <span style={{fontSize: '1rem', color: '#64748b'}}>días</span></p>
            <p className={styles.statLabel}>Racha Actual</p>
        </div>
        <div className={`${styles.statCard} ${isDarkMode ? styles.statCardDark : styles.statCardLight}`}>
            <Calendar color="#3b82f6" size={32} />
            <p className={styles.statValue}>{(habito?.dias || []).length}</p>
            <p className={styles.statLabel}>Días por semana</p>
        </div>
        <div className={`${styles.statCard} ${isDarkMode ? styles.statCardDark : styles.statCardLight}`}>
            <Trophy color="#fbbf24" size={32} />
            {/* APLICAMOS EL TRADUCTOR AQUÍ */}
            <p className={styles.statValue}>{tiempoTraducido}</p>
            <p className={styles.statLabel}>Meta Diaria</p>
        </div>
      </div>

      <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
        Tendencia últimos 7 días
      </h3>
      <div className={`${styles.chartContainer} ${isDarkMode ? styles.statCardDark : styles.statCardLight}`} style={{ height: '200px', padding: '10px', marginBottom: '30px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datosTendencia} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colorLinea} vertical={false} />
            <XAxis dataKey="dia" stroke={colorTexto} tick={{fill: colorTexto, fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis stroke={colorTexto} tick={{fill: colorTexto, fontSize: 12}} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip 
               cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}}
               contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }}
               formatter={(value) => [`${value}%`, 'Progreso']}
            />
            <Bar dataKey="progreso" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.tabsWrapper}>
        <button className={`${styles.tabButton} ${vistaActiva === 'semana' ? styles.tabActive : (isDarkMode ? styles.tabInactiveDark : styles.tabInactiveLight)}`} onClick={() => setVistaActiva('semana')}>Semana</button>
        <button className={`${styles.tabButton} ${vistaActiva === 'mes' ? styles.tabActive : (isDarkMode ? styles.tabInactiveDark : styles.tabInactiveLight)}`} onClick={() => setVistaActiva('mes')}>Mes</button>
        <button className={`${styles.tabButton} ${vistaActiva === 'ano' ? styles.tabActive : (isDarkMode ? styles.tabInactiveDark : styles.tabInactiveLight)}`} onClick={() => setVistaActiva('ano')}>Año</button>
      </div>

      <div style={{ minHeight: '250px' }}>
        {vistaActiva === 'semana' && <Semanal habito={habito} isDarkMode={isDarkMode} />}
        {vistaActiva === 'mes' && <Mensual habito={habito} isDarkMode={isDarkMode} />}
        {vistaActiva === 'ano' && <Anual habito={habito} isDarkMode={isDarkMode} />}
      </div>

      <div className={`${styles.dangerZone} ${isDarkMode ? styles.dangerZoneDark : styles.dangerZoneLight}`}>
          <h3 style={{ color: '#ef4444', margin: '0 0 10px 0', fontSize: '1.1rem' }}>Administración del Hábito</h3>
          
          <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Una vez que elimines este hábito, perderás todo tu historial y progreso acumulado. Esta acción es permanente y no se puede deshacer.
          </p>
          
          <div className={styles.botonesPeligro}>
            <button onClick={() => onEdit(habito)} className={styles.btnEditar}>
                <Edit size={20} /> Editar Metas del Hábito
            </button>
            <BotonEliminar onClick={eliminarHabito} borrando={borrando} isDarkMode={isDarkMode} />
          </div>
      </div>

    </div>
  );
}

export default Estadisticas;