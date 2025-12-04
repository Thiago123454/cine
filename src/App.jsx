import React, { useState, useEffect } from 'react';
import { Popcorn } from 'lucide-react';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useProducts } from './hooks/useProducts';
import { useNotifications } from './hooks/useNotifications';

// Componentes
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import ManagerControls from './components/ManagerControls';
import ProductList from './components/ProductList';
import NotificationToast from './components/NotificationToast';
import IosInstallPrompt from './components/IosInstallPrompt';

export default function App() {
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsIos(ios);
    setIsStandalone(standalone);
    if (ios && !standalone) setTimeout(() => setShowIosPrompt(true), 2000);
  }, []);

  const { user, role, setRole, managerName, loginManager, logout } = useAuth();
  const { products, loading, addProduct, deleteProduct, cycleStatus } = useProducts(user);
  const { notifications, permission, removeNotification, requestPermission } = useNotifications(products);

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-600 via-rose-600 to-red-700 flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
          <Popcorn size={48} className="mb-4 text-white drop-shadow-md" />
          <p className="font-bold drop-shadow-md">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <LoginScreen 
        onRoleSelect={setRole} 
        onLoginManager={loginManager}
        isIos={isIos && !isStandalone}
        showIosPrompt={showIosPrompt}
        onCloseIosPrompt={() => setShowIosPrompt(false)}
      />
    );
  }

  const totalAlerts = products.filter(p => p.pos1Status !== 'ok' || p.pos2Status !== 'ok').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-600 via-rose-600 to-red-700 pb-24 font-sans text-slate-800">
      <div className="fixed top-4 right-4 z-50 w-full max-w-sm flex flex-col items-end pointer-events-none gap-2 px-4 sm:px-0">
        {notifications.map(n => <NotificationToast key={n.id} notif={n} onClose={removeNotification} />)}
      </div>

      <Header 
        role={role}
        managerName={managerName}
        totalAlerts={totalAlerts}
        showNotifBtn={permission !== 'granted' && !isIos}
        isIos={isIos && !isStandalone}
        onReqPerm={requestPermission}
        onShowIos={() => setShowIosPrompt(true)}
        onLogout={logout}
      />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {role === 'manager' && (
          <ManagerControls 
            products={products}
            onAddProduct={addProduct}
          />
        )}

        <div>
          {role === 'manager' && <h3 className="text-xs font-bold text-white/80 uppercase mb-3 px-1 drop-shadow-sm">Inventario ({products.length})</h3>}
          <ProductList 
            products={products} 
            role={role} 
            onCycleStatus={cycleStatus} 
            onDelete={deleteProduct} 
          />
        </div>
      </main>

      {showIosPrompt && role && <IosInstallPrompt onClose={() => setShowIosPrompt(false)} />}
    </div>
  );
}