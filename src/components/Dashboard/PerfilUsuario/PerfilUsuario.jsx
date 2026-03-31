import React, { useState, useEffect } from 'react';
import styles from './PerfilUsuario.module.css';
import { Check } from 'lucide-react';
import { supabase } from '../../../supabase';

// 🚀 AÑADIMOS isDarkMode A LAS PROPIEDADES
function PerfilUsuario({ isOpen, isDarkMode }) {
  const [nombre, setNombre] = useState("Cargando...");
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [editando, setEditando] = useState(false);
  const [tempNombre, setTempNombre] = useState("");

  useEffect(() => {
    obtenerDatosUsuario();
  }, []);

  const obtenerDatosUsuario = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // 🧠 LÓGICA UNIVERSAL: Nombre completo > Nombre corto > Correo
      const metadatos = session.user.user_metadata;
      const nombreUniversal = metadatos?.full_name || metadatos?.name || session.user.email;
      
      setNombre(nombreUniversal);
      setTempNombre(nombreUniversal);

      // Cargar la foto
      const { data } = supabase.storage
        .from('avatares')
        .getPublicUrl(`${session.user.id}/avatar.png`);
      
      if (data) setImagenPerfil(data.publicUrl + '?t=' + new Date().getTime());
    } else {
      setNombre("Usuario");
      setTempNombre("Usuario");
    }
  };

  const guardarNombre = () => {
    setNombre(tempNombre);
    setEditando(false);
  };

  return (
    <div className={`${styles.perfilContainer} ${!isOpen ? styles.perfilCentered : ''}`}>
      <div className={`${styles.fotoWrapper} ${!isOpen ? styles.fotoSmall : ''}`}>
        
        {imagenPerfil ? (
          <img 
            src={imagenPerfil} 
            alt="Perfil" 
            className={styles.avatarImg} 
            onError={() => setImagenPerfil(null)} 
          />
        ) : (
          <div className={styles.avatarInicial}>{nombre.charAt(0).toUpperCase()}</div>
        )}
        
      </div>

      {isOpen && (
        <div className={styles.infoWrapper}>
          {editando ? (
            <div className={styles.editGroup}>
              <input 
                className={styles.inputNombre}
                value={tempNombre}
                onChange={(e) => setTempNombre(e.target.value)}
                autoFocus
              />
              <button onClick={guardarNombre} className={styles.btnOk}><Check size={14}/></button>
            </div>
          ) : (
            // 🎨 APLICAMOS EL COLOR INTELIGENTE AL NOMBRE
            <p 
              className={`${styles.userName} ${isDarkMode ? styles.textoDark : styles.textoLight}`} 
              onClick={() => setEditando(true)}
            >
              {nombre}
            </p>
          )}
          {/* 🎨 APLICAMOS EL COLOR INTELIGENTE AL RANGO/BIOGRAFÍA */}
          <span className={`${styles.rank} ${isDarkMode ? styles.subtextoDark : styles.subtextoLight}`}>
            Usuario Premium
          </span>
        </div>
      )}
    </div>
  );
}

export default PerfilUsuario;