// src/components/Estadisticas/Calendarios/Mensual.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase'; 
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Mensual.module.css'; // Importación actualizada

function Mensual({ habito, isDarkMode }) {
  const [datosMes, setDatosMes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [fechaActual, setFechaActual] = useState(new Date());

  useEffect(() => {
    if (habito && habito.id) cargarCalendarioMensual();
  }, [habito, fechaActual]);

  const cargarCalendarioMensual = async () => {
    setCargando(true);
    try {
      const anio = fechaActual.getFullYear();
      const mes = fechaActual.getMonth();

      const primerDiaDelMes = new Date(anio, mes, 1);
      const ultimoDiaDelMes = new Date(anio, mes + 1, 0);
      
      let diaSemanaInicio = primerDiaDelMes.getDay();
      diaSemanaInicio = diaSemanaInicio === 0 ? 7 : diaSemanaInicio;

      const strInicio = `${anio}-${String(mes + 1).padStart(2, '0')}-01`;
      const strFin = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(ultimoDiaDelMes.getDate()).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('historial_habitos')
        .select('fecha, progreso_alcanzado')
        .eq('habito_id', habito.id)
        .gte('fecha', strInicio)
        .lte('fecha', strFin);

      if (error) throw error;

      let diasMolde = [];
      const letrasBD = ['L', 'M', 'X', 'J', 'V', 'S', 'D']; 
      const diasHabito = habito?.dias || [];

      for (let i = 1; i < diaSemanaInicio; i++) {
        diasMolde.push({ numero: '', fecha: null, inactivo: true });
      }

      const hoyStr = new Date().toISOString().split('T')[0];

      for (let i = 1; i <= ultimoDiaDelMes.getDate(); i++) {
        const d = new Date(anio, mes, i);
        let diaLetraIndex = d.getDay() === 0 ? 6 : d.getDay() - 1; 
        const fechaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        let progresoDia = 0;
        
        if (data) {
          const registro = data.find(reg => reg.fecha === fechaStr);
          if (registro) progresoDia = registro.progreso_alcanzado;
        }

        diasMolde.push({
          numero: i,
          fecha: fechaStr,
          progreso: progresoDia,
          leTocaba: diasHabito.includes(letrasBD[diaLetraIndex]),
          esPasado: fechaStr < hoyStr,
          inactivo: false
        });
      }

      setDatosMes(diasMolde);
    } catch (error) {
      console.error("Error al cargar calendario mensual:", error);
    } finally {
      setCargando(false);
    }
  };

  const irMesAnterior = () => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1));
  };

  const irMesSiguiente = () => {
    const hoy = new Date();
    if (fechaActual.getFullYear() === hoy.getFullYear() && fechaActual.getMonth() === hoy.getMonth()) return;
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 1));
  };

  const nombreMes = fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const tituloMes = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
  const esMesActual = fechaActual.getMonth() === new Date().getMonth() && fechaActual.getFullYear() === new Date().getFullYear();

  return (
    <div className={`${styles.calendarioContainer} ${isDarkMode ? styles.darkTheme : styles.lightTheme}`}>
      
      <div className={styles.navegacion}>
        <button onClick={irMesAnterior} className={styles.btnNav}>
          <ChevronLeft size={20} />
        </button>
        <span className={styles.rangoTexto}>
          {tituloMes}
        </span>
        <button onClick={irMesSiguiente} className={styles.btnNav} disabled={esMesActual}>
          <ChevronRight size={20} />
        </button>
      </div>

      {cargando ? (
        <p style={{ textAlign: 'center', margin: '30px 0', color: '#64748b' }}>Cargando mes...</p>
      ) : (
        <div className={styles.mesContainer}>
          <div className={styles.diasSemanaHeader}>
            <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
          </div>

          <div className={styles.mesGrid}>
            {datosMes.map((dia, index) => {
              if (dia.inactivo) {
                return <div key={`empty-${index}`} className={styles.diaMesWrapper}></div>;
              }

              let estadoClase = styles.diaVacio;
              
              if (dia.progreso === 100) {
                estadoClase = styles.diaCompletado;
              } else if (dia.progreso > 0) {
                estadoClase = styles.diaParcial;
              } else if (dia.esPasado && dia.leTocaba) {
                estadoClase = styles.diaFallado;
              }

              return (
                <div key={dia.fecha} className={styles.diaMesWrapper}>
                  <div className={`${styles.circuloMes} ${estadoClase}`}>
                    {dia.numero}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Mensual;