// src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Cronometro from './Cronometro/Cronometro';
import CrearHabito from './CrearHabito/CrearHabito';
import EditarHabito from './EditarHabito/EditarHabito'; 
import RutinasPerfil from './RutinasPerfil/RutinasPerfil'; 
import DetoxDashboard from '../Detox/DetoxDashboard'; 
// 👇 IMPORTAMOS EL NUEVO COMPONENTE DE NOTIFICACIONES AQUÍ 👇
import PermisoNotificacion from '../UI/Notificaciones/PermisoNotificacion';
import styles from './Dashboard.module.css';
import { PlusCircle, Activity, Target, Clock } from 'lucide-react'; 
import { supabase } from '../../supabase'; 
import Estadisticas from '../Estadisticas/Estadisticas'; 
import { Toaster } from 'react-hot-toast'; 

function Dashboard({ session }) {
  const [isOpen, setIsOpen] = useState(true);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const temaGuardado = localStorage.getItem('temaOscuro');
    return temaGuardado === 'true'; 
  });

  useEffect(() => {
    localStorage.setItem('temaOscuro', isDarkMode);
  }, [isDarkMode]);

  const [vistaActual, setVistaActual] = useState('inicio'); 
  const [misHabitos, setMisHabitos] = useState([]); 
  const [habitoSeleccionado, setHabitoSeleccionado] = useState(null);
  const [cargandoDatos, setCargandoDatos] = useState(true); 
  const [notificadosHoy, setNotificadosHoy] = useState([]);
  
  const userName = session?.user?.user_metadata?.full_name 
                   || session?.user?.email?.split('@')[0] 
                   || "Usuario"; 

  // ==========================================
  // ⏱️ TRADUCTOR DE SEGUNDOS A TEXTO ELEGANTE
  // ==========================================
  const formatearSegundos = (segundosTotales) => {
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

  // ==========================================
  // 🔔 SISTEMA DE NOTIFICACIONES
  // ==========================================
  
  // 🛑 ELIMINAMOS LA PETICIÓN AUTOMÁTICA AQUÍ.
  // Ahora el componente <PermisoNotificacion /> se encarga de pedirlo amablemente.

  useEffect(() => {
    if (!('Notification' in window) || misHabitos.length === 0) return;

    const intervaloNotificaciones = setInterval(() => {
      const ahora = new Date();
      const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
      
      const mapaDias = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
      const diaHoy = mapaDias[ahora.getDay()];

      misHabitos.forEach(habito => {
        if (
          habito.recordatorio === horaActual &&
          habito.dias.includes(diaHoy) &&
          !notificadosHoy.includes(habito.id)
        ) {
          if (Notification.permission === 'granted') {
            new Notification(`¡Es hora de ${habito.nombre}! ⏱️`, {
              // USAMOS EL TRADUCTOR AQUÍ TAMBIÉN
              body: `Tienes una meta de ${formatearSegundos(habito.tiempo_objetivo)} para hoy.`,
              requireInteraction: true
            });
            setNotificadosHoy(prev => [...prev, habito.id]);
          }
        }
      });
    }, 10000); 

    return () => clearInterval(intervaloNotificaciones);
  }, [misHabitos, notificadosHoy]);

  // ==========================================
  // CARGA DE DATOS Y VIGILANTE DE RACHAS
  // ==========================================
  useEffect(() => {
    if (session?.user?.id) {
      cargarHabitos();
    }
  }, [session]);

  const cargarHabitos = async () => {
    try {
      setCargandoDatos(true);
      const { data, error } = await supabase
        .from('habitos')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const hoy = new Date();
      const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

      const habitosProcesados = await Promise.all((data || []).map(async (habito) => {
        let actualizacion = {};

        if (habito.ultima_fecha_progreso !== fechaHoy) {
          actualizacion.progreso_total = 0;
          actualizacion.ultima_fecha_progreso = fechaHoy;
        }

        if (habito.ultima_fecha_completado && habito.racha_actual > 0) {
          const ultima = new Date(habito.ultima_fecha_completado + 'T00:00:00');
          const hoyObj = new Date(fechaHoy + 'T00:00:00');
          
          const unDia = 1000 * 60 * 60 * 24;
          const diasDiferencia = Math.floor((hoyObj - ultima) / unDia);

          if (diasDiferencia > 1) {
            const mapaDias = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
            let rachaRota = false;

            for (let i = 1; i < diasDiferencia; i++) {
              const fechaIntermedia = new Date(ultima.getTime() + (i * unDia));
              const letraDia = mapaDias[fechaIntermedia.getDay()];
              
              if (habito.dias.includes(letraDia)) {
                rachaRota = true;
                break;
              }
            }

            if (rachaRota) {
              actualizacion.racha_actual = 0;
            }
          }
        }

        if (Object.keys(actualizacion).length > 0) {
          await supabase
            .from('habitos')
            .update(actualizacion)
            .eq('id', habito.id);
          
          return { ...habito, ...actualizacion }; 
        }

        return habito;
      }));

      setMisHabitos(habitosProcesados); 
      
    } catch (error) {
      console.error("Error al descargar hábitos:", error.message);
    } finally {
      setCargandoDatos(false);
    }
  };

  const agregarNuevoHabito = () => {
    cargarHabitos();
    setVistaActual('inicio');
  };

  const abrirDetalleHabito = (habito) => {
    setHabitoSeleccionado(habito);
    setVistaActual('estadisticas');
  };

  const abrirEstadisticasGlobales = () => {
    setHabitoSeleccionado(null);
    setVistaActual('estadisticas');
  };

  const manejarBorradoDeHabito = (idBorrado) => {
    setMisHabitos(misHabitos.filter(h => h.id !== idBorrado));
    setVistaActual('inicio'); 
  };

  // ==========================================
  // VISTAS DE RENDERIZADO
  // ==========================================
  const renderizarInicio = () => {
    if (cargandoDatos) {
        return <p style={{ color: isDarkMode ? 'white' : 'black', textAlign: 'center', marginTop: '50px' }}>Descargando tus hábitos...</p>;
    }

    if (misHabitos.length === 0) {
      return (
        <section className={`${styles.emptyStateCard} ${isDarkMode ? styles.emptyDark : styles.emptyLight}`}>
            <div className={styles.emptyIconWrapper}>
              <Target size={48} className={styles.emptyIcon} />
            </div>
            <h2 className={styles.welcomeTitle}>¡Comienza tu viaje, {userName}!</h2>
            <p className={styles.welcomeText}>
                La disciplina se construye un paso a la vez. Configura tu primer hábito para empezar.
            </p>
            <button className={styles.btnCreateFirst} onClick={() => setVistaActual('crear')}>
                <PlusCircle size={22} /> Crear mi primer hábito
            </button>
        </section>
      );
    } 
    
    const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    return (
      <div className="fade-in">
        <h2 className={styles.sectionTitle}>
          <Activity color="#3b82f6"/> Mis Hábitos Activos
        </h2>
        <p className={styles.sectionSubtitle}>Selecciona un hábito para ver tu progreso detallado.</p>
        
        <div className={styles.habitsGrid}>
          {misHabitos.map(habito => (
            <div key={habito.id} className={`${styles.habitCard} ${isDarkMode ? styles.cardDark : styles.cardLight}`} onClick={() => abrirDetalleHabito(habito)}>
              
              <div className={styles.habitHeader}>
                <div className={styles.habitIconWrapper}>
                  <Target size={24} className={styles.habitIcon} />
                </div>
                <div className={styles.habitInfo}>
                  <h3 className={styles.habitTitle}>{habito.nombre}</h3>
                  <p className={styles.habitMeta}>
                    {/* APLICAMOS EL TRADUCTOR A LA TARJETA */}
                    <Clock size={14} /> {formatearSegundos(habito.tiempo_objetivo)} / día
                  </p>
                </div>
              </div>

              <div className={styles.progressContainer}>
                <div className={styles.progressBarBg}>
                  <div className={styles.progressBarFill} style={{ width: `${habito.progreso_total || 0}%` }}></div>
                </div>
                <span className={styles.progressText}>{habito.progreso_total || 0}%</span>
              </div>

              <div className={styles.daysContainer}>
                {diasSemana.map(dia => {
                  const isActive = habito.dias.includes(dia);
                  return (
                    <span key={dia} className={`${styles.dayPill} ${isActive ? styles.dayActive : styles.dayInactive}`}>
                      {dia}
                    </span>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderizarContenido = () => {
    switch (vistaActual) {
      case 'inicio': 
        return renderizarInicio();
        
      case 'crear': 
        return (
          <CrearHabito 
            isDarkMode={isDarkMode} 
            agregarHabito={agregarNuevoHabito} 
            volver={() => setVistaActual('inicio')} 
          />
        );

      case 'editar':
        return (
          <EditarHabito 
            isDarkMode={isDarkMode} 
            habito={habitoSeleccionado} 
            onActualizar={() => { 
              cargarHabitos(); 
              setVistaActual('estadisticas'); 
            }} 
            volver={() => setVistaActual('estadisticas')} 
          />
        );

      case 'cronometro': 
        return (
          <Cronometro 
             isDarkMode={isDarkMode} 
             habitosDisponibles={misHabitos} 
             actualizarHabitos={cargarHabitos} 
           />
        );
        
      case 'estadisticas': 
        return (
          <Estadisticas 
             habito={habitoSeleccionado} 
             volver={() => setVistaActual('inicio')} 
             onDelete={manejarBorradoDeHabito}
             onEdit={() => setVistaActual('editar')}
             isDarkMode={isDarkMode}
           />
        );
      
      case 'rutinas':
        return (
          <RutinasPerfil 
            isDarkMode={isDarkMode} 
            userNameActual={userName}
          />
        );

      case 'detox':
        return (
          <DetoxDashboard usuario={session?.user} isDarkMode={isDarkMode} />
        );
        
      default: 
        return renderizarInicio();
    }
  };

  return (
    <div className={`${styles.dashboardContainer} ${isDarkMode ? styles.dark : styles.light}`}>
      
      {/* 👇 AQUÍ COLOCAMOS NUESTRO MODAL BONITO 👇 */}
      <PermisoNotificacion />

      <Sidebar 
        isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} 
        isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)}
        userName={userName} 
        setVistaActual={(vista) => {
          if(vista === 'estadisticas') abrirEstadisticasGlobales();
          else setVistaActual(vista);
        }} 
      />
      <main className={styles.mainContent}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            Aplicación de <span className={styles.textAccent}>Hábitos</span>
          </h1>
        </header>
        {renderizarContenido()}
        {vistaActual === 'inicio' && misHabitos.length > 0 && (
          <button className={styles.fabButton} onClick={() => setVistaActual('crear')}>
            <PlusCircle size={24}/> <span>Crear Nuevo Hábito</span>
          </button>
        )}
        
        <Toaster 
          position="bottom-center"
          toastOptions={{
            className: isDarkMode ? styles.toastDark : styles.toastLight
          }} 
        />
      </main>
    </div>
  );
}

export default Dashboard;