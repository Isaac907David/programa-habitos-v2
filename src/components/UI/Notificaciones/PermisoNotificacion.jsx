// src/components/UI/Notificaciones/PermisoNotificacion.jsx
import React, { useState, useEffect } from 'react';
import styles from './PermisoNotificacion.module.css';

const PermisoNotificacion = () => {
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    // 1. Verificamos si el navegador es moderno y soporta notificaciones
    const esCompatible = 'Notification' in window;
    
    // 2. Verificamos si el usuario aún no ha tomado una decisión (está en "default")
    // Si ya aceptó o bloqueó anteriormente, no mostramos nada.
    const permisoPendiente = esCompatible && Notification.permission === 'default';
    
    // 3. Verificamos si ya interactuó con nuestro modal personalizado en esta sesión
    const interactuoPreviamente = localStorage.getItem('app_notif_modal_visto');

    // Solo se muestra si cumple TODAS las condiciones de respeto al usuario
    if (esCompatible && permisoPendiente && !interactuoPreviamente) {
      const timer = setTimeout(() => {
        setMostrarModal(true);
      }, 4000); // 4 segundos para que el usuario se familiarice con la app antes del aviso
      return () => clearTimeout(timer);
    }
  }, []);

  const solicitarPermiso = async () => {
    try {
      // Llamamos al diálogo nativo del navegador
      const permiso = await Notification.requestPermission();
      
      // Guardamos la interacción para no volver a mostrar el modal personalizado
      localStorage.setItem('app_notif_modal_visto', 'true');
      
      if (permiso === 'granted') {
        console.log('Permiso de notificaciones concedido.');
      }
    } catch (error) {
      console.error('Error al solicitar permiso de notificación:', error);
    } finally {
      setMostrarModal(false);
    }
  };

  const cerrarTemporalmente = () => {
    // Si lo cierra sin decidir, no guardamos en localStorage 
    // para darle otra oportunidad en la siguiente visita.
    setMostrarModal(false);
  };

  if (!mostrarModal) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-labelledby="modal-title">
      <div className={styles.modalCard}>
        <div className={styles.iconContainer} aria-hidden="true">🔔</div>
        <h2 id="modal-title" className={styles.title}>Activar Recordatorios</h2>
        <p className={styles.description}>
          Mantén tu disciplina y no olvides tus objetivos. Permite que la aplicación te envíe recordatorios en el momento exacto de tus hábitos.
        </p>
        <div className={styles.buttonGroup}>
          <button className={styles.btnPrimary} onClick={solicitarPermiso}>
            Sí, activar recordatorios
          </button>
          <button className={styles.btnSecondary} onClick={cerrarTemporalmente}>
            Quizás más tarde
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermisoNotificacion;