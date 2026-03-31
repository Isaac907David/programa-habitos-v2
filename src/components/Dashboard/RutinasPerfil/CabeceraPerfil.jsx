// src/components/Dashboard/RutinasPerfil/CabeceraPerfil.jsx
import React, { useState } from 'react';
import styles from './CabeceraPerfil.module.css';

// 🚀 AÑADIMOS isDarkMode A LAS PROPIEDADES
export default function CabeceraPerfil({ usuario, onAvatarClick, onFileChange, fileRef, isDarkMode }) {
  const [imgError, setImgError] = useState(false);

  const inicial = usuario.nombre && usuario.nombre !== 'Cargando...' 
    ? usuario.nombre.charAt(0).toUpperCase() 
    : '';

  return (
    <div className={styles.header}>
      <div className={styles.avatarWrapper} onClick={onAvatarClick}>
        
        {usuario.avatar && !imgError ? (
          <img 
            src={usuario.avatar} 
            alt="Perfil" 
            onError={() => setImgError(true)} 
            className={styles.avatarImg} 
          />
        ) : (
          <span className={styles.avatarLetra}>
            {inicial}
          </span>
        )}
        
        <input 
          type="file" 
          accept="image/*" 
          ref={fileRef} 
          style={{ display: 'none' }} 
          onChange={(e) => {
            setImgError(false);
            onFileChange(e);
          }} 
        />
      </div>
      
      <div className={styles.info}>
        {/* 🎨 APLICAMOS LAS CLASES DE COLOR INTELIGENTES AL NOMBRE */}
        <h2 className={`${styles.username} ${isDarkMode ? styles.textoDark : styles.textoLight}`}>
          {usuario.nombre || 'Cargando...'}
        </h2>
        
        {/* 🎨 APLICAMOS LAS CLASES DE COLOR INTELIGENTES A LA BIO */}
        <p className={`${styles.bio} ${isDarkMode ? styles.subtextoDark : styles.subtextoLight}`}>
          {usuario.bio || 'Sin biografía.'}
        </p>
      </div>
    </div>
  );
}