// src/components/Dashboard/Sidebar.jsx
import React, { useRef, useState, useEffect } from 'react';
import styles from './Sidebar.module.css';
import { 
  LayoutGrid, 
  Timer, 
  BookImage, 
  Settings, 
  Moon, 
  LogOut, 
  MoreVertical, 
  Menu,
  ShieldAlert
} from 'lucide-react';

import { supabase } from '../../supabase';

function Sidebar({ isOpen, toggleSidebar, isDarkMode, toggleTheme, userName, setVistaActual }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);
  
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsMenuRef = useRef(null);

  const inicial = userName ? userName.charAt(0).toUpperCase() : 'I';

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarUrl(imageUrl);
    }
  };

  const handleCerrarSesion = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Hubo un error al cerrar sesión: " + error.message);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed} ${isDarkMode ? styles.dark : styles.light}`}>
      
      {/* SECCIÓN SUPERIOR */}
      <div className={styles.topSection}>
        <div className={`${styles.userInfoContainer} ${!isOpen ? styles.centerItems : ''}`}>
          
          <div 
            className={styles.avatarWrapper} 
            onClick={handleAvatarClick}
            title="Actualizar foto de perfil"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Perfil" className={styles.avatarImage} />
            ) : (
              <span className={styles.avatarInitial}>{inicial}</span>
            )}
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
          </div>

          {isOpen && (
            <div className={styles.userDetails}>
              <h3 className={styles.userName}>{userName}</h3>
              <p className={styles.userRole}>Usuario Premium</p>
            </div>
          )}

          <button 
            className={isOpen ? styles.toggleBtnOpen : styles.toggleBtnClosed} 
            onClick={toggleSidebar} 
            title={isOpen ? "Ocultar menú" : "Mostrar menú"}
          >
            {isOpen ? <MoreVertical size={20} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* SECCIÓN MEDIA: Navegación Principal (Herramientas) */}
      <nav className={styles.navMenu}>
        <button className={styles.navItem} onClick={() => { setVistaActual('inicio'); setShowSettingsMenu(false); }}>
          <LayoutGrid size={22} className={styles.navIcon} />
          {isOpen && <span className={styles.navLabel}>Inicio</span>}
        </button>
        
        <button className={styles.navItem} onClick={() => { setVistaActual('cronometro'); setShowSettingsMenu(false); }}>
          <Timer size={22} className={styles.navIcon} />
          {isOpen && <span className={styles.navLabel}>Cronómetro</span>}
        </button>

        <button className={styles.navItem} onClick={() => { setVistaActual('detox'); setShowSettingsMenu(false); }}>
          <ShieldAlert size={22} className={styles.navIcon} />
          {isOpen && <span className={styles.navLabel}>Modo Detox</span>}
        </button>
      </nav>

      {/* SECCIÓN INFERIOR: Configuración y Perfil */}
      <div className={styles.footerActions} ref={settingsMenuRef}>
        
        <button className={styles.navItem} onClick={() => { setVistaActual('rutinas'); setShowSettingsMenu(false); }}>
          <BookImage size={22} className={styles.navIcon} />
          {isOpen && <span className={styles.navLabel}>Mis Rutinas</span>}
        </button>
        
        {/* El menú flotante de Configuración */}
        {showSettingsMenu && (
          <div className={`${styles.settingsDropdown} ${isDarkMode ? styles.dropdownDark : styles.dropdownLight}`}>
            
            <button className={`${styles.dropdownItem} ${styles.themeBtn}`} onClick={toggleTheme}>
              <Moon size={18} className={styles.navIcon} />
              <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </button>
            
            <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={handleCerrarSesion}>
              <LogOut size={18} className={styles.navIcon} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}

        {/* Botón de Configuración (La tuerca) */}
        <button 
          className={`${styles.actionBtn} ${showSettingsMenu ? styles.activeSetting : ''}`} 
          onClick={() => setShowSettingsMenu(!showSettingsMenu)}
        >
          <Settings size={22} className={styles.navIcon} />
          {isOpen && <span className={styles.navLabel}>Configuración</span>}
        </button>
        
      </div>
      
    </aside>
  );
}

export default Sidebar;