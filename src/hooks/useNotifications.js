import { useState, useEffect, useRef } from 'react';
import { getStatusLabel } from '../utils';

export function useNotifications(products) {
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState('default');
  const [swRegistration, setSwRegistration] = useState(null);
  const prevProductsRef = useRef({});
  const isFirstLoad = useRef(true);
  const pendingNotifications = useRef({});

  useEffect(() => {
    if ('Notification' in window) setPermission(Notification.permission);
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => setSwRegistration(reg))
        .catch(err => console.error('SW Error', err));
    }
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    if (isFirstLoad.current) {
      const cache = {};
      products.forEach(p => { cache[p.id] = { ...p }; });
      prevProductsRef.current = cache;
      isFirstLoad.current = false;
      return;
    }

    products.forEach(newP => {
      const oldP = prevProductsRef.current[newP.id];
      if (!oldP) {
        prevProductsRef.current[newP.id] = { ...newP };
        return;
      }

      const checkAndNotify = (posName, newStatus, field) => {
        if (newP[field] !== oldP[field]) {
          const key = `${newP.id}_${field}`;
          if (pendingNotifications.current[key]) clearTimeout(pendingNotifications.current[key]);

          pendingNotifications.current[key] = setTimeout(() => {
            if (newStatus !== 'ok') {
              addNotification(
                `🚨 ALERTA: ${posName}`, 
                `${newP.name}: ${getStatusLabel(newStatus)}`, 
                newStatus, 
                true
              );
            }
            delete pendingNotifications.current[key];
          }, 60000);
        }
      };

      checkAndNotify('Candy 1', newP.pos1Status, 'pos1Status');
      checkAndNotify('Candy 2', newP.pos2Status, 'pos2Status');

      prevProductsRef.current[newP.id] = { ...newP };
    });
  }, [products]);

  const addNotification = (title, message, status, important = false) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, title, message, status }]);
    
    if (important && permission === 'granted') {
      const opts = { body: message, icon: '/vite.svg', tag: 'stock-alert' };
      if (swRegistration?.showNotification) {
        swRegistration.showNotification(title, opts);
      } else {
        new Notification(title, opts);
      }
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const requestPermission = async () => {
    const res = await Notification.requestPermission();
    setPermission(res);
    if (res === 'granted') addNotification('✅ Notificaciones', 'Activadas correctamente', 'ok');
  };

  return { notifications, permission, removeNotification, requestPermission };
}