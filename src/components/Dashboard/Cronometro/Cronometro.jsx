// src/components/Dashboard/Cronometro/Cronometro.jsx
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Save, Trophy, CheckCircle, Info, ChevronDown, ChevronUp, Check } from 'lucide-react'; 
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css'; 
import styles from './Cronometro.module.css';
import { supabase } from '../../../supabase';
import toast from 'react-hot-toast'; 

function Cronometro({ isDarkMode, habitosDisponibles, actualizarHabitos }) {
  const [tiempoSesion, setTiempoSesion] = useState(0); 
  const [activo, setActivo] = useState(false);
  const [actividad, setActividad] = useState('');
  
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  
  const [metaTotalSegundos, setMetaTotalSegundos] = useState(1800);
  const [progresoPrevioSegundos, setProgresoPrevioSegundos] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);

  useEffect(() => {
    if (habitosDisponibles && habitosDisponibles.length > 0 && !actividad) {
      seleccionarHabito(habitosDisponibles[0].nombre);
    }
  }, [habitosDisponibles, actividad]);

  const seleccionarHabito = (nombreHabito) => {
    const habito = habitosDisponibles.find(h => h.nombre === nombreHabito);
    if (habito) {
      setActividad(nombreHabito);
      
      // 🚀 EL ARREGLO ESTÁ AQUÍ: La base de datos ya nos da segundos, no hay que multiplicar
      const metaSegundos = habito.tiempo_objetivo || habito.tiempoObjetivo || 0;
      setMetaTotalSegundos(metaSegundos);
      
      const previo = Math.floor(((habito.progreso_total || 0) / 100) * metaSegundos);
      setProgresoPrevioSegundos(previo);
      
      setTiempoSesion(0);
      setActivo(false);
      setMostrarCelebracion(false);
      setDropdownAbierto(false); 
    }
  };

  const segundosRestantesHoy = metaTotalSegundos - progresoPrevioSegundos;

  useEffect(() => {
    let intervalo = null;
    if (activo) {
      intervalo = setInterval(() => {
        setTiempoSesion((t) => {
          const nuevoTiempo = t + 1;
          
          if (nuevoTiempo >= segundosRestantesHoy) {
            setActivo(false);
            setMostrarCelebracion(true); 
            return segundosRestantesHoy; 
          }
          return nuevoTiempo;
        });
      }, 1000);
    } else {
      clearInterval(intervalo);
    }
    return () => clearInterval(intervalo);
  }, [activo, segundosRestantesHoy]);

  const formatearTiempo = () => {
    const faltan = segundosRestantesHoy - tiempoSesion;
    if (faltan <= 0) return "00:00"; 

    const horas = Math.floor(faltan / 3600).toString().padStart(2, '0');
    const minutos = Math.floor((faltan % 3600) / 60).toString().padStart(2, '0');
    const segundos = (faltan % 60).toString().padStart(2, '0');
    return horas !== "00" ? `${horas}:${minutos}:${segundos}` : `${minutos}:${segundos}`;
  };

  // ⏱️ TRADUCTOR PARA EL SUBTÍTULO (Igual que en Dashboard)
  const formatearSegundosElegante = (segundosTotales) => {
    if (!segundosTotales) return "0s";
    const h = Math.floor(segundosTotales / 3600);
    const m = Math.floor((segundosTotales % 3600) / 60);
    const s = segundosTotales % 60;

    let resultado = [];
    if (h > 0) resultado.push(`${h}h`);
    if (m > 0) resultado.push(`${m}m`);
    if (s > 0 || resultado.length === 0) resultado.push(`${s}s`);
    return resultado.join(' ');
  };

  const guardarSesion = async () => {
    if (tiempoSesion === 0) {
      toast.error("No puedes guardar una sesión de 0 segundos.");
      return;
    }

    const habitoActual = habitosDisponibles.find(h => h.nombre === actividad);
    if (!habitoActual) return;

    setGuardando(true);

    try {
      const tiempoTotalAcumulado = progresoPrevioSegundos + tiempoSesion;
      let nuevoProgreso = Math.round((tiempoTotalAcumulado / metaTotalSegundos) * 100);
      if (nuevoProgreso > 100) nuevoProgreso = 100;

      let nuevaRacha = habitoActual.racha_actual || 0;
      const alcanzoMeta = nuevoProgreso >= 100;
      
      const hoy = new Date();
      const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

      let datosAActualizar = { progreso_total: nuevoProgreso };
      
      if (alcanzoMeta) {
          nuevaRacha += 1;
          datosAActualizar.racha_actual = nuevaRacha;
          datosAActualizar.ultima_fecha_completado = fechaHoy; 
      }

      const { error: errorHabito } = await supabase
        .from('habitos')
        .update(datosAActualizar)
        .eq('id', habitoActual.id);

      if (errorHabito) throw errorHabito;

      const { data: historialHoy } = await supabase
        .from('historial_habitos')
        .select('*')
        .eq('habito_id', habitoActual.id)
        .eq('fecha', fechaHoy)
        .single();

      if (historialHoy) {
        await supabase.from('historial_habitos')
        .update({ progreso_alcanzado: nuevoProgreso, meta_completada: alcanzoMeta })
        .eq('id', historialHoy.id);
      } else {
        await supabase.from('historial_habitos')
        .insert({
          habito_id: habitoActual.id,
          user_id: habitoActual.user_id,
          fecha: fechaHoy,
          progreso_alcanzado: nuevoProgreso,
          meta_completada: alcanzoMeta
        });
      }

      toast.success(alcanzoMeta ? "¡Victoria Guardada! 🔥" : "¡Progreso Guardado! ⏱️");
      
      setProgresoPrevioSegundos(previo => previo + tiempoSesion);
      setTiempoSesion(0);
      setMostrarCelebracion(false);
      if (actualizarHabitos) actualizarHabitos();

    } catch (error) {
      toast.error("Error al guardar en la nube: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const yaEstaCompletado = progresoPrevioSegundos >= metaTotalSegundos;
  const porcentajeVisual = yaEstaCompletado 
                            ? 100 
                            : Math.min(100, ((progresoPrevioSegundos + tiempoSesion) / metaTotalSegundos) * 100);

  const isSelectorDisabled = activo || guardando;

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.cardDark : styles.cardLight}`}>
      
      <div className={styles.selectorWrapper}>
        <label className={`${styles.label} ${isDarkMode ? styles.labelDark : styles.labelLight}`}>
          ¿Qué hábito vas a trabajar hoy?
        </label>
        
        <div 
            className={`${styles.dropdownHeader} ${isDarkMode ? styles.headerDark : styles.headerLight} ${isSelectorDisabled ? styles.headerDisabled : ''}`}
            onClick={() => !isSelectorDisabled && setDropdownAbierto(!dropdownAbierto)}
        >
            <span>{actividad || "Selecciona un hábito"}</span>
            {dropdownAbierto ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
        </div>

        {dropdownAbierto && (
            <div className={`${styles.dropdownList} ${isDarkMode ? styles.listDark : styles.listLight}`}>
                {habitosDisponibles && habitosDisponibles.length > 0 ? (
                    habitosDisponibles.map(habito => {
                        const esElSeleccionado = habito.nombre === actividad;
                        return (
                            <div 
                                key={habito.id} 
                                className={`${styles.dropdownItem} ${isDarkMode ? styles.itemDark : styles.itemLight} ${esElSeleccionado ? styles.itemActive : ''}`}
                                onClick={() => seleccionarHabito(habito.nombre)}
                            >
                                <span>{habito.nombre}</span>
                                {esElSeleccionado && <Check size={18} color="#3b82f6" />}
                            </div>
                        );
                    })
                ) : (
                    <div className={`${styles.dropdownItem} ${isDarkMode ? styles.itemDark : styles.itemLight}`}>
                        No hay hábitos. Crea uno primero...
                    </div>
                )}
            </div>
        )}
        
        {!yaEstaCompletado && (
          <div className={`${styles.infoMessage} ${isDarkMode ? styles.infoMessageDark : styles.infoMessageLight}`}>
            <Info size={16} />
            <p className={styles.infoMessageText}>Registra cualquier avance. Alcanza el 100% para aumentar tu racha 🔥.</p>
          </div>
        )}
      </div>

      <div className={styles.centerContentArea}>
        
        {yaEstaCompletado ? (
          <div className={styles.successContainer}>
            <CheckCircle size={75} className={styles.successIcon} />
            <h2 className={styles.successTitle}>¡Todo listo por hoy!</h2>
            <p className={styles.successText}>Has completado tu meta diaria para este hábito. Vuelve mañana.</p>
          </div>
        ) : mostrarCelebracion ? (
          <div className={styles.celebrationContainer}>
            <Trophy size={80} color="#fbbf24" className={styles.celebrationIcon} />
            <h2 className={`${styles.celebrationTitle} ${isDarkMode ? styles.celebrationTitleDark : styles.celebrationTitleLight}`}>¡Felicidades! 🎉</h2>
            <p className={styles.celebrationText}>Hábito Completado al 100%</p>
          </div>
        ) : (
          <div className={`${styles.progressWrapper} ${activo ? styles.glowActive : ''}`}>
            <CircularProgressbarWithChildren
              value={porcentajeVisual} 
              strokeWidth={6} 
              styles={buildStyles({
                pathColor: '#10b981', 
                trailColor: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                strokeLinecap: 'round', 
                pathTransitionDuration: 0.5,
              })}
            >
              <div className={styles.timerInner}>
                <div className={`${styles.timerDisplay} ${isDarkMode ? styles.textDark : styles.textLight}`}>
                  {formatearTiempo()} 
                </div>
                <div className={styles.timerSubtitle}>
                  {/* AQUÍ TAMBIÉN APLICAMOS EL TRADUCTOR PARA QUE DIGA "Faltan 1m" o "Faltan 45s" */}
                  {activo ? 'Enfoque Activo' : `Faltan ${formatearSegundosElegante(segundosRestantesHoy)} hoy`}
                </div>
              </div>
            </CircularProgressbarWithChildren>
          </div>
        )}
      </div>

      {!yaEstaCompletado && (
        <>
          <div className={styles.controls}>
            {!activo ? (
              <button className={`${styles.btnControl} ${styles.btnPlay}`} onClick={() => setActivo(true)} disabled={guardando || mostrarCelebracion}>
                <Play fill="currentColor" size={28} />
              </button>
            ) : (
              <button className={`${styles.btnControl} ${styles.btnPause}`} onClick={() => setActivo(false)} disabled={guardando}>
                <Pause fill="currentColor" size={28} />
              </button>
            )}
            
            <button className={`${styles.btnControl} ${styles.btnReset} ${isDarkMode ? styles.btnResetDark : styles.btnResetLight}`} onClick={() => { setActivo(false); setTiempoSesion(0); setMostrarCelebracion(false); }} disabled={guardando}>
              <RotateCcw size={24} />
            </button>
          </div>

          <button 
             className={`${styles.btnSave} ${mostrarCelebracion ? styles.btnSaveCelebration : ''}`} 
             onClick={guardarSesion} 
             disabled={guardando || tiempoSesion === 0}
          >
            <Save size={20} /> 
            {guardando ? 'Guardando...' : mostrarCelebracion ? 'Guardar Victoria' : 'Guardar Progreso'}
          </button>
        </>
      )}
    </div>
  );
}

export default Cronometro;