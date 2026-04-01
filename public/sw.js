// public/sw.js

// 1. Escuchar el evento de notificación (Push)
self.addEventListener('push', function(event) {
  let data = {};
  
  // Intentamos parsear los datos recibidos, si no, usamos valores por defecto
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: 'Recordatorio de Actividad',
      body: 'Es momento de realizar tu hábito programado.'
    };
  }

  const title = data.title || 'Recordatorio de Actividad';
  const options = {
    body: data.body || 'Es momento de realizar tu hábito programado.',
    icon: '/logo-habitos.png', 
    badge: '/logo-habitos.png', // Icono pequeño para la barra de estado
    vibrate: [200, 100, 200],
    tag: 'habito-notificacion', // Agrupa notificaciones para no llenar la pantalla
    renotify: true, // Vibra incluso si ya hay una notificación activa
    data: {
      url: data.url || '/'
    },
    // Botones de acción universales
    actions: [
      {
        action: 'confirm-action',
        title: 'Marcar como completado',
      },
      {
        action: 'close-action',
        title: 'Cerrar',
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 2. Manejar la interacción con la notificación
self.addEventListener('notificationclick', function(event) {
  const notification = event.notification;
  const action = event.action;

  // Cerramos la notificación inmediatamente al hacer clic
  notification.close();

  if (action === 'confirm-action') {
    // Aquí podrías integrar una llamada a Supabase en el futuro
    console.log('Acción: El usuario marcó el hábito como completado.');
  } 
  
  // En cualquier caso (clic normal o botones), intentamos enfocar la app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Si la app ya está abierta en alguna pestaña, le damos el foco
      for (let client of windowClients) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no está abierta, la abrimos en una nueva pestaña
      if (clients.openWindow) {
        return clients.openWindow(notification.data.url || '/');
      }
    })
  );
});

// 3. Limpieza de versiones antiguas (Opcional pero recomendado)
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});