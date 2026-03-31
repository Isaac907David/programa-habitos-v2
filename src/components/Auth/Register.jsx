// src/components/Auth/Register.jsx
import React, { useState } from 'react';
import styles from './Register.module.css';
import { supabase } from '../../supabase'; 

function Register({ cambiarVista }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false); // NUEVO: Estado de carga

  const handleGoogleSignIn = async () => {
    setCargando(true);
    const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
    if (error) {
        alert("Error con Google Auth: " + error.message);
        setCargando(false);
    }
  };

  const handleRegistroNormal = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Por favor, llena tu correo y genera una contraseña.");
      return;
    }

    if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }
    
    setCargando(true);

    // Llamada a Supabase para crear la cuenta
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      alert("Error al crear la cuenta: " + error.message);
      setCargando(false);
    } else {
      alert("¡Cuenta creada con éxito! Bienvenido a la disciplina.");
      if (cambiarVista) cambiarVista('dashboard'); // Entra directo
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.header}>
            <h1 className={styles.title}>Crear Cuenta</h1>
            <p className={styles.subtitle}>Empieza a trackear tus hábitos hoy</p>
          </div>

          <form onSubmit={handleRegistroNormal}>
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
                placeholder="Crea una contraseña (mín. 6 caracteres)" 
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
                {cargando ? 'Creando cuenta...' : 'Empezar ahora'}
            </button>
          </form>

          <p className={styles.footerText}>
            ¿Ya tienes cuenta?{' '}
            <span className={styles.link} onClick={() => !cargando && cambiarVista('login')}>Inicia sesión</span>
          </p>
        </div>
      </div>

      <div className={styles.visualPanel}>
        <div className={styles.visualContent}>
          <h2 className={styles.visualTitle}>Construye tu mejor versión.</h2>
          <p className={styles.visualText}>
            Lleva el control exacto de tus rutinas, mide tu progreso diario 
            y alcanza tus metas con nuestra herramienta de seguimiento. 
            La consistencia es la clave del éxito.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;