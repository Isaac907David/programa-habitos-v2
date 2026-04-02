# 🚀 TEK HABITS | Aplicación Web Progresiva (PWA)

[![Desplegado en Vercel](https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel)](https://tu-link-de-vercel.vercel.app/)
[![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

**[🟢 Ver Proyecto en Vivo Aquí](https://programa-habitos-v2-72p4m4s6a-isaac907davids-projects.vercel.app/)** *(Abre este enlace desde tu móvil para instalar la app).*

---

## 📖 Memoria Descriptiva del Proyecto

**TEK HABITS** no es solo una lista de tareas; es un ecosistema de disciplina y alto rendimiento diseñado bajo la filosofía del "Modo Hardcore". Nació de la necesidad de contar con una herramienta robusta que permitiera gestionar metas diarias, calcular rachas de cumplimiento y, lo más importante, integrarse de manera nativa en el dispositivo del usuario.

Este proyecto fue desarrollado íntegramente como una **Progressive Web App (PWA)**. El objetivo principal de su arquitectura fue superar las limitaciones de una página web tradicional, implementando **Service Workers** para ejecutar procesos en segundo plano y enviar notificaciones push nativas interactivas (con botones de acción), logrando una experiencia de usuario idéntica a la de una aplicación móvil descargada desde una tienda de apps. 

Para el desarrollo de esta plataforma, trabajé optimizando la lógica de estado con React, conectando un backend en la nube mediante Supabase (para bases de datos en tiempo real y autenticación) y diseñando una interfaz completamente responsive utilizando CSS Modules con un enfoque centrado en la usabilidad (UI/UX).

---

## ✨ Funcionalidades Principales

* **Arquitectura PWA Instalable:** Configuración completa de `manifest.json` y Service Workers, permitiendo la instalación directa en dispositivos iOS, Android y Escritorio sin pasar por App Stores.
* **Notificaciones Push Nativas en Segundo Plano:** Uso de la API del Service Worker (`registration.showNotification`) para enviar alertas push con botones de acción ("Completado", "Cerrar"), logrando eludir las restricciones de ahorro de energía en sistemas operativos complejos como Android/HyperOS.
* **Sistema de Autenticación:** Registro e inicio de sesión seguro gestionado a través de Supabase Auth.
* **Motor de Rachas Inteligente:** Lógica compleja en el cliente y servidor para calcular el cumplimiento de días consecutivos, reseteando rachas automáticamente si el usuario falla un día de compromiso.
* **Cronómetro Integrado:** Conversión dinámica de tiempos (HH:MM:SS a segundos puros para almacenamiento en base de datos) permitiendo al usuario medir el tiempo exacto dedicado a cada hábito.
* **Diseño Premium y Dark Mode:** Interfaz construida con CSS Modules, adaptativa a dispositivos móviles y con un sistema de persistencia para modo claro/oscuro utilizando `localStorage`.

---

## 🛠️ Tecnologías Implementadas

### Frontend
* **React (con Vite):** Para la construcción de la interfaz de usuario mediante componentes reutilizables y un entorno de desarrollo ultrarrápido.
* **CSS Modules:** Para la encapsulación de estilos, evitando conflictos de clases y manteniendo un diseño limpio y escalable.
* **Lucide React:** Implementación de iconografía moderna y ligera.
* **React Hot Toast:** Para el feedback visual no intrusivo (alertas de éxito/error).

### Backend & Base de Datos (BaaS)
* **Supabase:** Base de datos PostgreSQL en la nube, utilizada para almacenar los hábitos de los usuarios, sus progresos diarios y las rachas históricas de forma segura.

### Web APIs & PWA
* **Service Workers API:** Para la ejecución de código independiente del hilo principal del navegador.
* **Notification API & Push API:** Para la gestión de permisos y entrega de alertas al sistema operativo del usuario.

---

## 🧠 Retos Técnicos Superados

1. **Gestión de Notificaciones en Dispositivos Móviles:** El mayor desafío fue lograr que las notificaciones sonaran en dispositivos Android restrictivos (como Xiaomi). Se solucionó migrando de la Notification API estándar a la del Service Worker, inyectando acciones nativas (`actions`) directamente al sistema operativo.
2. **Sincronización de Tiempos y Fechas:** Manejar el progreso diario requirió construir un "traductor" personalizado en JavaScript que convierte los segundos guardados en la base de datos a un formato legible (HH:MM:SS) en la interfaz, y viceversa, evaluando además los días de la semana mediante arreglos `['D', 'L', 'M', 'X', 'J', 'V', 'S']` sincronizados con el reloj del sistema.

---

*Proyecto diseñado y desarrollado por **Isaac Diaz**.*
