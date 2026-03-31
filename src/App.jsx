// src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';

function App() {
  const [session, setSession] = useState(null);
  const [vistaActual, setVistaActual] = useState('register');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 1. EL VIGILANTE: Busca la "llave maestra" guardada en tu celular o PC
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setVistaActual('dashboard'); // Si hay llave, entra directo al panel
      }
      setCargando(false);
    });

    // 2. EL RADAR: Escucha en tiempo real si el usuario inicia o cierra sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setVistaActual('dashboard');
      } else {
        setVistaActual('login'); // Si presiona "Cerrar Sesión", lo expulsa a la puerta
      }
    });

    // Limpiamos el radar cuando se cierra la app
    return () => subscription.unsubscribe();
  }, []);

  const cambiarVista = (nuevaVista) => {
    setVistaActual(nuevaVista);
  };

  // Pantalla de carga Premium mientras el vigilante busca la llave en la memoria
  if (cargando) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#020617', /* Fondo oscuro premium */
        color: '#3b82f6', /* Azul vibrante */
        fontFamily: 'system-ui, sans-serif'
      }}>
        <h2>Abriendo tu espacio...</h2>
      </div>
    );
  }

  // === NAVEGADOR INTELIGENTE ===
  if (vistaActual === 'dashboard' && session) {
    return <Dashboard session={session} />; 
  } else if (vistaActual === 'login') {
    return <Login cambiarVista={cambiarVista} />;
  } else {
    return <Register cambiarVista={cambiarVista} />;
  }
}

export default App;