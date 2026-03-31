// src/components/Dashboard/Configuracion/Configuracion.jsx
import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, User, Save } from 'lucide-react';
import styles from './Configuracion.module.css';
import toast from 'react-hot-toast';

function Configuracion({ isDarkMode, volver, userNameActual }) {
  // Estados locales para la UI
  const [nombre, setNombre] = useState(userNameActual || '');
  const [fotoPreview, setFotoPreview] = useState(null); 
  const [guardando, setGuardando] = useState(false);
  
  // Referencia para el input de archivo oculto
  const fileInputRef = useRef(null);

  // Manejador para cuando el usuario selecciona una foto
  const manejarSeleccionImagen = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validamos que sea una imagen
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen válido.');
        return;
      }
      
      // Creamos una URL local temporal para previsualizar la imagen inmediatamente
      const imageUrl = URL.createObjectURL(file);
      setFotoPreview(imageUrl);
    }
  };

  const dispararSelectorDeArchivo = () => {
    fileInputRef.current.click();
  };

  const guardarConfiguracion = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("El nombre no puede estar vacío.");
      return;
    }

    setGuardando(true);
    
    // AQUÍ IRÁ LA LÓGICA DE SUPABASE EN LA FASE 2
    // 1. Subir imagen al Storage de Supabase (si hay una nueva).
    // 2. Actualizar el user_metadata de la sesión de Supabase con el nuevo nombre e imagen.
    
    // Simulamos un guardado por ahora
    setTimeout(() => {
      toast.success("Configuración simulada guardada (Falta Backend).");
      setGuardando(false);
    }, 1500);
  };

  // Obtener la inicial del nombre para el placeholder
  const inicial = nombre ? nombre.charAt(0).toUpperCase() : 'U';

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.containerDark : styles.containerLight}`}>
      
      <div className={styles.header}>
        <button onClick={volver} className={styles.btnVolver}>
          <ArrowLeft size={28} />
        </button>
        <h2 className={styles.title}>Perfil y Ajustes</h2>
      </div>

      <form onSubmit={guardarConfiguracion}>
        
        {/* --- Zona del Avatar --- */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            {fotoPreview ? (
              <img src={fotoPreview} alt="Tu Avatar" className={styles.avatarImage} />
            ) : (
              <div className={styles.avatarPlaceholder}>{inicial}</div>
            )}
            
            <button 
              type="button" 
              className={styles.btnCambiarFoto} 
              onClick={dispararSelectorDeArchivo}
              title="Cambiar foto de perfil"
            >
              <Camera size={20} />
            </button>

            {/* Input oculto que se activa con el botón */}
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/webp" 
              ref={fileInputRef} 
              onChange={manejarSeleccionImagen}
              className={styles.fileInputHidden}
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Toca la cámara para cambiar</span>
        </div>

        {/* --- Zona del Nombre --- */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <User size={18} color="#3b82f6" /> Nombre de Usuario
          </label>
          <input 
            type="text" 
            className={styles.input} 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
            placeholder="¿Cómo te llamas?"
            disabled={guardando}
          />
        </div>

        <button type="submit" className={styles.btnGuardar} disabled={guardando}>
          <Save size={20} />
          {guardando ? 'Actualizando perfil...' : 'Guardar Cambios'}
        </button>

      </form>
    </div>
  );
}

export default Configuracion;