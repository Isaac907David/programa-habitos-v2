// src/components/Estadisticas/Calendarios/Semanal.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase'; 
import { ChevronLeft, ChevronRight, Check, X, Flame } from 'lucide-react';
import styles from './Semanal.module.css';

function Semanal({ habito, isDarkMode }) {
  const [datosSemana, setDatosSemana] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [semanasAtras, setSemanasAtras] = useState(0);
  const [rangoTexto, setRangoTexto] = useState('');

  useEffect(() => {
    if (habito && habito.id) cargarCalendarioSemanal();
  }, [habito, semanasAtras]);

  const cargarCalendarioSemanal = async () => {
    setCargando(true);
    try {
      const hoy = new Date();
      hoy.setDate(hoy.getDate() - (semanasAtras * 7));
      
      const diaSemana = hoy.getDay() === 0 ? 7 : hoy.getDay(); 
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - diaSemana + 1); 
      const domingo = new Date(lunes);
      domingo.setDate(lunes.getDate() + 6); 

      const opcionesFecha = { month: 'short', day: 'numeric' };
      setRangoTexto(`${lunes.toLocaleDateString('es-ES', opcionesFecha)} - ${domingo.toLocaleDateString('es-ES', opcionesFecha)}`);

      const strLunes = `${lunes.getFullYear()}-${String(lunes.getMonth() + 1).padStart(2, '0')}-${String(lunes.getDate()).padStart(2, '0')}`;
      const strDomingo = `${domingo.getFullYear()}-${String(domingo.getMonth() + 1).padStart(2, '0')}-${String(domingo.getDate()).padStart(2, '0')}`;

      const nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      // BLINDAJE LÓGICO: Exactamente las letras que usa nuestra BD
      const letrasBD = ['L', 'M', 'X', 'J', 'V', 'S', 'D']; 
      
      let semanaMolde = [];
      const diasHabito = habito?.dias || []; // Blindaje anti-nulos
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(lunes);
        d.setDate(lunes.getDate() + i);
        semanaMolde.push({
          nombreDia: nombresDias[i],
          numeroDia: d.getDate(),
          fecha: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
          progreso: 0,
          leTocaba: diasHabito.includes(letrasBD[i]) // Lectura exacta y segura
        });
      }

      const { data, error } = await supabase
        .from('historial_habitos')
        .select('fecha, progreso_alcanzado')
        .eq('habito_id', habito.id)
        .gte('fecha', strLunes) 
        .lte('fecha', strDomingo); 

      if (error) throw error;

      if (data) {
        data.forEach(reg => {
          const idx = semanaMolde.findIndex(m => m.fecha === reg.fecha);
          if (idx !== -1) semanaMolde[idx].progreso = reg.progreso_alcanzado;
        });
      }

      setDatosSemana(semanaMolde);
    } catch (error) {
      console.error("Error al cargar calendario:", error);
    } finally {
      setCargando(false);
    }
  };

  const irSemanaAnterior = () => setSemanasAtras(prev => prev + 1);
  const irSemanaSiguiente = () => setSemanasAtras(prev => Math.max(0, prev - 1));

  return (
    <div className={`${styles.calendarioContainer} ${isDarkMode ? styles.darkTheme : styles.lightTheme}`}>
      <div className={styles.navegacion}>
        <button onClick={irSemanaAnterior} className={styles.btnNav}>
          <ChevronLeft size={20} />
        </button>
        <span className={styles.rangoTexto}>
          {semanasAtras === 0 ? 'Esta Semana' : rangoTexto}
        </span>
        <button onClick={irSemanaSiguiente} className={styles.btnNav} disabled={semanasAtras === 0}>
          <ChevronRight size={20} />
        </button>
      </div>

      {cargando ? (
        <p style={{ textAlign: 'center', margin: '30px 0', color: '#64748b' }}>Cargando historial...</p>
      ) : (
        <div className={styles.semanaGrid}>
          {datosSemana.map((dia, index) => {
            let estadoClase = styles.diaVacio;
            let Icono = null;

            if (dia.progreso === 100) {
              estadoClase = styles.diaCompletado;
              Icono = <Check size={18} strokeWidth={3} />;
            } else if (dia.progreso > 0) {
              estadoClase = styles.diaParcial;
              Icono = <Flame size={18} strokeWidth={2} />;
            } else if (dia.fecha < new Date().toISOString().split('T')[0] && dia.leTocaba) {
              estadoClase = styles.diaFallado;
              Icono = <X size={18} strokeWidth={2} />;
            }

            return (
              <div key={index} className={styles.diaColumna}>
                <span className={styles.nombreDia}>{dia.nombreDia}</span>
                <div className={`${styles.circuloDia} ${estadoClase}`}>
                  {Icono}
                </div>
                <span className={styles.numeroDia}>{dia.numeroDia}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Semanal;