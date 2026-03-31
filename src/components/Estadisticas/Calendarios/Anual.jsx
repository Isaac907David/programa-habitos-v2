// src/components/Estadisticas/Calendarios/Anual.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabase'; 
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Anual.module.css';

function Anual({ habito, isDarkMode }) {
  const [datosAnuales, setDatosAnuales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());

  useEffect(() => {
    if (habito && habito.id) cargarCalendarioAnual();
  }, [habito, anioActual]);

  const cargarCalendarioAnual = async () => {
    setCargando(true);
    try {
      const strInicio = `${anioActual}-01-01`;
      const strFin = `${anioActual}-12-31`;

      const { data, error } = await supabase
        .from('historial_habitos')
        .select('fecha, progreso_alcanzado')
        .eq('habito_id', habito.id)
        .gte('fecha', strInicio)
        .lte('fecha', strFin);

      if (error) throw error;

      let diasMolde = [];
      const primerDiaDelAnio = new Date(anioActual, 0, 1);
      
      let diaSemanaInicio = primerDiaDelAnio.getDay();
      diaSemanaInicio = diaSemanaInicio === 0 ? 7 : diaSemanaInicio;

      for (let i = 1; i < diaSemanaInicio; i++) {
        diasMolde.push({ id: `pad-${i}`, inactivo: true });
      }

      const esBisiesto = (anioActual % 4 === 0 && anioActual % 100 !== 0) || anioActual % 400 === 0;
      const totalDias = esBisiesto ? 366 : 365;
      
      const letrasBD = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
      const diasHabito = habito?.dias || [];
      const hoyStr = new Date().toISOString().split('T')[0];

      for (let i = 1; i <= totalDias; i++) {
        const d = new Date(anioActual, 0, i);
        const fechaStr = `${anioActual}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        let diaLetraIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
        
        let progresoDia = 0;
        
        if (data) {
          const registro = data.find(reg => reg.fecha === fechaStr);
          if (registro) progresoDia = registro.progreso_alcanzado;
        }

        diasMolde.push({
          id: fechaStr,
          fecha: fechaStr,
          progreso: progresoDia,
          leTocaba: diasHabito.includes(letrasBD[diaLetraIndex]),
          esPasado: fechaStr < hoyStr,
          inactivo: false
        });
      }

      setDatosAnuales(diasMolde);
    } catch (error) {
      console.error("Error al cargar mapa de calor anual:", error);
    } finally {
      setCargando(false);
    }
  };

  const irAnioAnterior = () => setAnioActual(prev => prev - 1);
  const irAnioSiguiente = () => {
    if (anioActual < new Date().getFullYear()) {
      setAnioActual(prev => prev + 1);
    }
  };

  return (
    <div className={`${styles.calendarioContainer} ${isDarkMode ? styles.darkTheme : styles.lightTheme}`}>
      
      <div className={styles.navegacion}>
        <button onClick={irAnioAnterior} className={styles.btnNav}>
          <ChevronLeft size={20} />
        </button>
        <span className={styles.rangoTexto}>{anioActual}</span>
        <button onClick={irAnioSiguiente} className={styles.btnNav} disabled={anioActual === new Date().getFullYear()}>
          <ChevronRight size={20} />
        </button>
      </div>

      {cargando ? (
        <p style={{ textAlign: 'center', margin: '30px 0', color: '#64748b' }}>Cargando mapa anual...</p>
      ) : (
        <div className={styles.tarjetaAnual}>
          
          <div className={styles.heatmapCuerpo}>
            {/* LAS LETRAS FIJAS A LA IZQUIERDA */}
            <div className={styles.etiquetasDias}>
              <span className={styles.etiquetaDia}>L</span>
              <span className={styles.etiquetaDia}>M</span>
              <span className={styles.etiquetaDia}>X</span>
              <span className={styles.etiquetaDia}>J</span>
              <span className={styles.etiquetaDia}>V</span>
              <span className={styles.etiquetaDia}>S</span>
              <span className={styles.etiquetaDia}>D</span>
            </div>

            {/* EL ÁREA CON SCROLL HORIZONTAL */}
            <div className={styles.scrollWrapper}>
              <div className={styles.heatmapGrid}>
                {datosAnuales.map((dia) => {
                  if (dia.inactivo) {
                    return <div key={dia.id} className={`${styles.cuadroDia} ${styles.cuadroVacio}`}></div>;
                  }

                  let claseNivel = styles.nivel0; 
                  
                  if (dia.progreso === 100) {
                    claseNivel = styles.nivel2; 
                  } else if (dia.progreso > 0) {
                    claseNivel = styles.nivel1; 
                  } else if (dia.esPasado && dia.leTocaba) {
                    claseNivel = styles.nivelFallado; 
                  }

                  return (
                    <div 
                      key={dia.id} 
                      className={`${styles.cuadroDia} ${claseNivel}`}
                      title={`${dia.fecha}: ${dia.progreso}% completado`}
                    ></div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* LEYENDA */}
          <div className={styles.leyenda}>
            <span>Menos</span>
            <div className={`${styles.leyendaItem} ${styles.nivel0}`}></div>
            <div className={`${styles.leyendaItem} ${styles.nivelFallado}`}></div>
            <div className={`${styles.leyendaItem} ${styles.nivel1}`}></div>
            <div className={`${styles.leyendaItem} ${styles.nivel2}`}></div>
            <span>Más</span>
          </div>

        </div>
      )}
    </div>
  );
}

export default Anual;