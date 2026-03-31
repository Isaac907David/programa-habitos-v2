// src/components/Auth/Login.jsx
import React, { useState } from 'react';
import styles from './Login.module.css';
import { supabase } from '../../supabase'; 

function Login({ cambiarVista }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false); // NUEVO: Estado de carga

  const handleGoogleSignIn = async () => {
    setCargando(true);
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: window.location.origin 
      }
    });
    
    if (error) {
        alert("Error con Google Auth: " + error.message);
        setCargando(false);
    }
  };

  const handleLoginNormal = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Por favor, ingresa tu correo y contraseña.");
      return;
    }

    setCargando(true); // Inicia la animación de carga

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      // ¡Éxito! Entramos al Dashboard
      if (cambiarVista) {
          cambiarVista('dashboard');
      }

    } catch (error) {
       alert("Credenciales incorrectas o usuario no encontrado.");
       console.error("Error de login:", error.message);
       setCargando(false); // Apaga la carga si hay error
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.header}>
            <h1 className={styles.title}>¡Bienvenido!</h1>
            <p className={styles.subtitle}>Ingresa para ver tu progreso</p>
          </div>

          <form onSubmit={handleLoginNormal}>
            <div className={styles.formGroup}>
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={cargando}
              />
            </div>

            <div className={styles.formGroup}>
              <input 
                type="password" 
                placeholder="Tu contraseña" 
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={cargando}
              />
            </div>

            <button type="button" className={styles.btnGoogle} onClick={handleGoogleSignIn} disabled={cargando}>
              <span style={{ color: '#ea4335', fontWeight: '900' }}>G</span> Continuar con Google
            </button>

            <button type="submit" className={styles.btnSubmit} disabled={cargando}>
                {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className={styles.footerText}>
            ¿No tienes cuenta?{' '}
            <span className={styles.link} onClick={() => !cargando && cambiarVista('register')}>Regístrate aquí</span>
          </p>
        </div>
      </div>

      <div className={styles.visualPanel}>
        <div className={styles.visualContent}>
          <h2 className={styles.visualTitle}>Retoma tu camino.</h2>
          <p className={styles.visualText}>
            Cada día es una nueva oportunidad para construir la disciplina. 
            Revisa tus estadísticas, ajusta tus tiempos y sigue avanzando 
            hacia tus metas.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;