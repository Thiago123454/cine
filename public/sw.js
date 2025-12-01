// public/sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forza al SW a activarse inmediatamente
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Toma control de la página inmediatamente
});

// Escuchar notificaciones push (si usáramos un servidor real)
// O en este caso, manejar las que generamos localmente
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Cierra la notificación al tocarla

  // Intenta abrir o enfocar la ventana de la app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta, enfócala
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abre una nueva (opcional, ajusta la URL si es necesario)
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});