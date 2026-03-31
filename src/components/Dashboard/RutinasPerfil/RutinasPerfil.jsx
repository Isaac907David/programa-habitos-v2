// src/components/Dashboard/RutinasPerfil/RutinasPerfil.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react'; 
import styles from './RutinasPerfil.module.css';
import { supabase } from '../../../supabase'; 
import toast from 'react-hot-toast';

import BotonSubirVictoria from './BotonSubirVictoria';
import FotoHabito from './FotoHabito';
import CabeceraPerfil from './CabeceraPerfil';
import RachaMetrica from './Metricas/RachaMetrica';
import HabitosMetrica from './Metricas/HabitosMetrica';
import NivelMetrica from './Metricas/NivelMetrica';

// Recibe isDarkMode para el diseño nocturno
export default function RutinasPerfil({ isDarkMode }) {
  const [usuario, setUsuario] = useState({ nombre: 'Cargando...', avatar: null, bio: 'Construyendo mi mejor versión.' });
  const [stats, setStats] = useState({ rachaGlobal: 0, habitosActivos: 0, nivel: 1 });
  const [evidencias, setEvidencias] = useState([]);
  const [habitosHoy, setHabitosHoy] = useState([]);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const [idSeleccionado, setIdSeleccionado] = useState(null);

  useEffect(() => {
    cargarDatosReales();
  }, []);

  const cargarDatosReales = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const userId = session.user.id;

    const nombreUsuario = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0];
    const { data: urlData } = supabase.storage.from('avatares').getPublicUrl(`${userId}/avatar.png`);
    
    setUsuario({
      nombre: nombreUsuario,
      avatar: urlData.publicUrl + '?t=' + Date.now(), 
      bio: session.user.user_metadata?.bio || 'Construyendo mi mejor versión, un día a la vez.'
    });

    // 🚀 LÓGICA MODO HARDCORE: La Racha Global se basa en tu hábito más débil
    const { data: tablaHabitos } = await supabase.from('habitos').select('racha_actual').eq('user_id', userId);
    if (tablaHabitos && tablaHabitos.length > 0) {
      // Math.min saca el número más pequeño. Si un hábito está en 0, todo se vuelve 0.
      const rachaHardcore = Math.min(...tablaHabitos.map(habito => habito.racha_actual || 0));
      
      setStats({
        rachaGlobal: rachaHardcore,
        habitosActivos: tablaHabitos.length,
        // Tu nivel sube 1 punto por cada 3 DÍAS PERFECTOS consecutivos
        nivel: Math.floor(rachaHardcore / 3) + 1 
      });
    } else {
      setStats({ rachaGlobal: 0, habitosActivos: 0, nivel: 1 });
    }

    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    const { data: completadosHoy } = await supabase
      .from('historial_habitos')
      .select('id, habitos(nombre)')
      .eq('user_id', userId)
      .eq('fecha', fechaHoy)
      .eq('meta_completada', true);
    setHabitosHoy(completadosHoy || []);

    const { data: muroData } = await supabase
      .from('historial_habitos')
      .select('id, fecha, evidencia_url, habitos(nombre)')
      .eq('user_id', userId)
      .not('evidencia_url', 'is', null)
      .order('fecha', { ascending: false });
    setEvidencias(muroData || []);
  };

  const cambiarAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const toastId = toast.loading('Actualizando perfil...');
    const { data: { session } } = await supabase.auth.getSession();
    
    await supabase.storage.from('avatares').upload(`${session.user.id}/avatar.png`, file, { upsert: true });
    toast.success('¡Identidad actualizada!', { id: toastId });
    cargarDatosReales();
  };

  const subirVictoria = async (e) => {
    const file = e.target.files[0];
    if (!file || !idSeleccionado) return;
    const toastId = toast.loading('Subiendo victoria...');
    const { data: { session } } = await supabase.auth.getSession();
    const filePath = `${session.user.id}/${Date.now()}_${file.name}`;

    try {
      await supabase.storage.from('evidencias').upload(filePath, file);
      const { data: publicUrlData } = supabase.storage.from('evidencias').getPublicUrl(filePath);
      await supabase.from('historial_habitos').update({ evidencia_url: publicUrlData.publicUrl }).eq('id', idSeleccionado);
      toast.success('¡Muro actualizado!', { id: toastId });
      setModalAbierto(false);
      cargarDatosReales();
    } catch (error) {
      toast.error('Error al subir la foto', { id: toastId });
    }
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.darkContainer : ''}`}>
      
      <CabeceraPerfil 
        usuario={usuario}
        onAvatarClick={() => avatarInputRef.current.click()}
        onFileChange={cambiarAvatar}
        fileRef={avatarInputRef}
        isDarkMode={isDarkMode} 
      />

      <div className={styles.statsRow}>
        <RachaMetrica valor={stats.rachaGlobal} />
        <HabitosMetrica valor={stats.habitosActivos} />
        <NivelMetrica valor={stats.nivel} />
      </div>

      <div className={styles.grid}>
        {evidencias.length > 0 ? (
          evidencias.map((ev) => (
            <FotoHabito key={ev.id} evidencia={ev} />
          ))
        ) : (
          <div className={styles.emptyGrid}>Aún no hay victorias en tu muro.</div>
        )}
      </div>

      <BotonSubirVictoria onClick={() => setModalAbierto(true)} />

      {/* MODAL CON CLASES DINÁMICAS PARA MODO OSCURO */}
      {modalAbierto && (
        <div className={`${styles.modalOverlay} ${isDarkMode ? styles.darkOverlay : ''}`} onClick={() => setModalAbierto(false)}>
          <div className={`${styles.modalContent} ${isDarkMode ? styles.darkModal : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={isDarkMode ? styles.darkText : ''}>Selecciona el Hábito</h3>
              <button onClick={() => setModalAbierto(false)} className={`${styles.btnClose} ${isDarkMode ? styles.darkBtnClose : ''}`}>
                <X size={20}/>
              </button>
            </div>
            
            <div className={styles.listaHabitos}>
              {habitosHoy.length > 0 ? (
                habitosHoy.map(h => (
                  <button 
                    key={h.id} 
                    className={`${styles.btnHabitoModal} ${isDarkMode ? styles.darkBtnHabito : ''}`} 
                    onClick={() => {
                      setIdSeleccionado(h.id);
                      fileInputRef.current.click();
                    }}
                  >
                    {h.habitos?.nombre || 'Hábito sin nombre'}
                  </button>
                ))
              ) : (
                <p className={`${styles.textEmptyModal} ${isDarkMode ? styles.darkTextEmpty : ''}`}>
                  Completa un hábito hoy para habilitar la subida.
                </p>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} style={{display:'none'}} onChange={subirVictoria} />
          </div>
        </div>
      )}

    </div>
  );
}