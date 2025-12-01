import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  Popcorn, 
  IceCream, 
  Candy, 
  Beer, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Store,
  LayoutDashboard,
  LogOut,
  ClipboardList,
  ArrowRight,
  UserCircle2,
  KeyRound
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyBeJyDV_9XtQ3uHM_ZYI7BoE40fn6QfPYo",
  authDomain: "cinemultiplex.firebaseapp.com",
  projectId: "cinemultiplex",
  storageBucket: "cinemultiplex.firebasestorage.app",
  messagingSenderId: "595772193554",
  appId: "1:595772193554:web:6de65d7b948930957851cb"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "multiplex-canning"; // Le ponemos un nombre fijo

// --- Components ---

// Status Badge Component
const StatusBadge = ({ status, onClick, readonly = false }) => {
  const getStatusStyle = (s) => {
    switch (s) {
      case 'ok': return 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200';
      case 'low': return 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse-slow hover:bg-amber-200';
      case 'out': return 'bg-red-100 text-red-700 border-red-200 font-bold hover:bg-red-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getLabel = (s) => {
    switch (s) {
      case 'ok': return 'Stock OK';
      case 'low': return 'Queda Poco';
      case 'out': return 'FALTA';
      default: return '---';
    }
  };

  const getIcon = (s) => {
    switch (s) {
      case 'ok': return <CheckCircle2 size={18} />;
      case 'low': return <AlertCircle size={18} />;
      case 'out': return <XCircle size={18} />;
      default: return null;
    }
  };

  return (
    <button
      onClick={readonly ? undefined : onClick}
      disabled={readonly}
      className={`
        w-full flex items-center justify-center gap-2 px-2 py-3 rounded-lg border transition-all shadow-sm
        ${getStatusStyle(status)}
        ${readonly ? 'cursor-default opacity-80' : 'cursor-pointer active:scale-95 hover:shadow-md'}
      `}
    >
      {getIcon(status)}
      <span className="text-sm sm:text-base font-bold whitespace-nowrap">{getLabel(status)}</span>
    </button>
  );
};

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'pos1', 'pos2', 'manager'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Login State
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // New Product State
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Snacks');

  // --- Auth & Data Loading ---
  useEffect(() => {
    // 1. Pedir permiso para notificaciones al cargar la app
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = collection(db, 'artifacts', appId, 'public', 'data', 'cinema_products');
    
    const unsubscribeData = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // --- LÓGICA DE NOTIFICACIONES ---
      // Solo ejecutamos esto si no es la primera carga (para que no suene todo al abrir la app)
      if (!loading) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "modified") {
            const data = change.doc.data();
            const productName = data.name;
            
            // Verificar si algo pasó a estado crítico en Candy 1
            if (data.pos1Status === 'out') {
               new Notification(`🚨 FALTA en Candy 1`, { body: `${productName} se agotó.` });
            } else if (data.pos1Status === 'low') {
               new Notification(`⚠️ Poco Stock en Candy 1`, { body: `${productName} se está acabando.` });
            }

            // Verificar si algo pasó a estado crítico en Candy 2
            if (data.pos2Status === 'out') {
               new Notification(`🚨 FALTA en Candy 2`, { body: `${productName} se agotó.` });
            } else if (data.pos2Status === 'low') {
               new Notification(`⚠️ Poco Stock en Candy 2`, { body: `${productName} se está acabando.` });
            }
          }
        });
      }
      // --------------------------------

      // Ordenar: Primero los que faltan (out), luego poco (low), luego ok, luego por nombre
      items.sort((a, b) => {
        const score = (status) => (status === 'out' ? 0 : status === 'low' ? 1 : 2);
        const scoreA = Math.min(score(a.pos1Status || 'ok'), score(a.pos2Status || 'ok'));
        const scoreB = Math.min(score(b.pos1Status || 'ok'), score(b.pos2Status || 'ok'));
        
        if (scoreA !== scoreB) return scoreA - scoreB;
        return a.name.localeCompare(b.name);
      });
      
      setProducts(items);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching data:", error);
      setLoading(false);
    });

    return () => unsubscribeData();
  }, [user, loading]); // Dependencias actualizadas

  // --- Actions ---

  const handleLogin = (e) => {
    e.preventDefault();
    const u = username.toLowerCase().trim();
    const p = password.trim();

    // Validar credenciales
    if ((u === 'thiago' && p === 'river') || (u === 'fiorella' && p === 'river')) {
      setRole('manager');
      setLoginError('');
      setUsername('');
      setPassword('');
      setShowLogin(false);
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  const cycleStatus = async (productId, currentStatus, posField) => {
    if (!user) return;
    
    let nextStatus = 'ok';
    if (currentStatus === 'ok') nextStatus = 'low'; // De OK a Poco
    else if (currentStatus === 'low') nextStatus = 'out'; // De Poco a Falta
    else if (currentStatus === 'out') nextStatus = 'ok'; // De Falta a OK

    const ref = doc(db, 'artifacts', appId, 'public', 'data', 'cinema_products', productId);
    await updateDoc(ref, {
      [posField]: nextStatus,
      lastUpdated: serverTimestamp()
    });
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!newProdName.trim() || !user) return;

    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'cinema_products'), {
      name: newProdName,
      category: newProdCategory,
      pos1Status: 'ok',
      pos2Status: 'ok',
      createdAt: serverTimestamp()
    });

    setNewProdName('');
  };

  const deleteProduct = async (id) => {
    if (!confirm('¿Seguro que quieren borrar este producto de la lista?')) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'cinema_products', id));
  };

  // --- Render Helpers ---

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Snacks': return <Popcorn className="text-amber-500" />;
      case 'Bebidas': return <Beer className="text-blue-500" />;
      case 'Dulces': return <Candy className="text-pink-500" />;
      case 'Helados': return <IceCream className="text-purple-500" />;
      default: return <Popcorn className="text-gray-400" />;
    }
  };

  // Filter products specifically for restocking
  const getRestockItems = (posField) => {
    return products.filter(p => {
      const status = p[posField] || 'ok';
      return status === 'low' || status === 'out';
    });
  };

  // --- Views ---

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-600 via-rose-600 to-red-700 flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
          <Popcorn size={48} className="mb-4 text-white drop-shadow-md" />
          <p className="font-bold drop-shadow-md">Cargando Multiplex...</p>
        </div>
      </div>
    );
  }

  // Login / Role Selection Screen (Styled like the image)
  if (!role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-600 via-rose-600 to-red-700 flex flex-col items-center justify-center p-4">
        {/* Simulating the white login box from the image */}
        <div className="max-w-md w-full bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Red Header like in the image */}
          <div className="bg-red-600 p-6 flex flex-col items-center justify-center text-white shadow-inner">
            <Popcorn size={48} className="mb-2 drop-shadow-sm" />
            <h1 className="text-2xl font-black uppercase tracking-wider text-center drop-shadow-md">Multiplex Canning</h1>
            <p className="text-red-100 text-xs mt-1 font-medium">Sistema de Stock Interno</p>
          </div>
          
          <div className="p-8 space-y-4">
            {!showLogin ? (
              <>
                <p className="text-center text-gray-500 mb-4 font-medium">Seleccione su perfil de acceso:</p>
                
                <button onClick={() => setRole('pos1')} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 p-4 rounded-lg border border-gray-200 flex items-center justify-between transition-all font-bold group shadow-sm">
                  <span className="flex items-center gap-3 text-blue-600"><Store size={20}/> Candy 1</span>
                  <span className="text-gray-400 group-hover:translate-x-1 transition-transform"><ArrowRight size={20} /></span>
                </button>
                
                <button onClick={() => setRole('pos2')} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 p-4 rounded-lg border border-gray-200 flex items-center justify-between transition-all font-bold group shadow-sm">
                  <span className="flex items-center gap-3 text-indigo-600"><Store size={20}/> Candy 2</span>
                  <span className="text-gray-400 group-hover:translate-x-1 transition-transform"><ArrowRight size={20} /></span>
                </button>
                
                <div className="border-t border-gray-100 my-4"></div>
                
                <button onClick={() => setShowLogin(true)} className="w-full bg-red-50 hover:bg-red-100 text-red-700 p-3 rounded-lg border border-red-100 flex items-center justify-center gap-2 transition-all font-semibold text-sm">
                  <UserCircle2 size={18} /> Acceso Administrativo
                </button>
              </>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-bold text-gray-800">Acceso Gerencia</h2>
                  <p className="text-xs text-gray-400">Fiorella & Thiago</p>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <UserCircle2 className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-sm"
                    />
                  </div>
                  
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      type="password" 
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-2 bg-red-50 text-red-600 text-xs rounded text-center font-medium flex items-center justify-center gap-1">
                    <AlertCircle size={12} /> {loginError}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => { setShowLogin(false); setLoginError(''); setUsername(''); setPassword(''); }}
                    className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    Volver
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95"
                  >
                    Ingresar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        <p className="mt-8 text-white/60 text-xs">Multiplex &copy; {new Date().getFullYear()}</p>
      </div>
    );
  }

  const pos1Needs = getRestockItems('pos1Status');
  const pos2Needs = getRestockItems('pos2Status');
  const totalAlerts = pos1Needs.length + pos2Needs.length;

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-600 via-rose-600 to-red-700 pb-24 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-red-700 text-white shadow-lg sticky top-0 z-20 border-b border-red-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              {role === 'manager' ? <LayoutDashboard size={20} /> : <Store size={20} />}
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight drop-shadow-sm">
                {role === 'manager' ? 'Fiorella & Thiago' : role === 'pos1' ? 'Candy 1' : 'Candy 2'}
              </h1>
              {role === 'manager' && totalAlerts > 0 ? (
                <p className="text-xs text-yellow-200 animate-pulse font-bold">{totalAlerts} alertas de stock</p>
              ) : (
                <p className="text-xs text-red-200">Multiplex Canning</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => setRole(null)}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* --- SECTION: MANAGER QUICK ACTION DASHBOARD --- */}
        {role === 'manager' && (
          <div className="space-y-4">
            {/* Quick Restock List */}
            {totalAlerts > 0 ? (
              <div className="bg-white rounded-xl overflow-hidden shadow-xl border-l-4 border-red-500">
                <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center gap-2">
                  <ClipboardList className="text-red-600" size={20} />
                  <h2 className="font-bold text-red-800">Reposición Urgente</h2>
                </div>
                
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
                  {/* Needs for Candy 1 */}
                  <div className="flex-1 p-4">
                    <h3 className="text-xs uppercase tracking-wider text-blue-600 font-bold mb-3 flex items-center gap-2">
                      <Store size={14} /> Candy 1
                    </h3>
                    {pos1Needs.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">Sin pendientes ✅</p>
                    ) : (
                      <ul className="space-y-2">
                        {pos1Needs.map(p => (
                          <li key={p.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded border border-gray-200">
                            <span className="font-medium text-gray-700">{p.name}</span>
                            {p.pos1Status === 'out' ? (
                               <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">FALTA</span>
                            ) : (
                               <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">POCO</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Needs for Candy 2 */}
                  <div className="flex-1 p-4">
                    <h3 className="text-xs uppercase tracking-wider text-indigo-600 font-bold mb-3 flex items-center gap-2">
                      <Store size={14} /> Candy 2
                    </h3>
                    {pos2Needs.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">Sin pendientes ✅</p>
                    ) : (
                      <ul className="space-y-2">
                        {pos2Needs.map(p => (
                          <li key={p.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded border border-gray-200">
                            <span className="font-medium text-gray-700">{p.name}</span>
                            {p.pos2Status === 'out' ? (
                               <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">FALTA</span>
                            ) : (
                               <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">POCO</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur border-l-4 border-emerald-500 p-4 rounded-xl flex items-center justify-center gap-3 text-emerald-700 shadow-lg">
                <CheckCircle2 />
                <span className="font-bold">¡Todo perfecto! Stock al 100%.</span>
              </div>
            )}

            {/* Add Product Form */}
            <div className="bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg border border-white/20">
               <h2 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                  <Plus size={14} /> Cargar Nuevo Producto
               </h2>
               <form onSubmit={addProduct} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nombre..."
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="flex-1 bg-gray-100 border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all"
                  />
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="bg-gray-100 border border-gray-200 rounded px-2 py-2 text-sm text-gray-800 cursor-pointer"
                  >
                    <option value="Snacks">Snacks</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Dulces">Dulces</option>
                    <option value="Helados">Helados</option>
                  </select>
                  <button 
                    type="submit"
                    disabled={!newProdName.trim()}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-4 rounded transition-colors shadow-sm"
                  >
                    <Plus size={18} />
                  </button>
               </form>
            </div>
          </div>
        )}

        {/* --- SECTION: MAIN INVENTORY LIST --- */}
        <div>
          {role === 'manager' && (
             <h3 className="text-xs font-bold text-white/80 uppercase mb-3 px-1 drop-shadow-sm">
               Inventario Completo ({products.length})
             </h3>
          )}
          
          <div className="space-y-3">
            {products.length === 0 ? (
              <div className="text-center py-12 text-white/80 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <p className="font-medium">Lista vacía.</p>
              </div>
            ) : (
              products.map((product) => (
                <div 
                  key={product.id} 
                  className={`
                    bg-white rounded-xl overflow-hidden shadow-lg flex flex-col sm:flex-row
                    ${(role === 'manager' && (product.pos1Status !== 'ok' || product.pos2Status !== 'ok')) 
                      ? 'ring-2 ring-yellow-400' 
                      : ''}
                  `}
                >
                  {/* Product Info */}
                  <div className="p-3 sm:p-4 flex items-center gap-3 flex-1 border-b sm:border-b-0 sm:border-r border-gray-100 bg-white">
                    <div className="p-2 bg-gray-50 rounded-lg shrink-0 border border-gray-100">
                      {getCategoryIcon(product.category)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-gray-800 truncate pr-2 leading-tight">{product.name}</h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                        {product.category}
                      </span>
                    </div>
                    {role === 'manager' && (
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="ml-auto text-gray-300 hover:text-red-500 p-2 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Controls Area */}
                  <div className="flex divide-x divide-gray-100 h-auto sm:h-full">
                    {/* POS 1 Control */}
                    {(role === 'manager' || role === 'pos1') && (
                      <div className="flex-1 p-2 sm:p-3 flex flex-col items-center justify-center min-w-[120px] bg-gray-50/50">
                        <span className="text-[10px] uppercase text-gray-400 font-bold mb-1">Candy 1</span>
                        <StatusBadge 
                          status={product.pos1Status || 'ok'} 
                          onClick={() => cycleStatus(product.id, product.pos1Status || 'ok', 'pos1Status')}
                          readonly={role === 'manager'}
                        />
                      </div>
                    )}

                    {/* POS 2 Control */}
                    {(role === 'manager' || role === 'pos2') && (
                      <div className="flex-1 p-2 sm:p-3 flex flex-col items-center justify-center min-w-[120px] bg-gray-50/50">
                        <span className="text-[10px] uppercase text-gray-400 font-bold mb-1">Candy 2</span>
                        <StatusBadge 
                          status={product.pos2Status || 'ok'} 
                          onClick={() => cycleStatus(product.id, product.pos2Status || 'ok', 'pos2Status')}
                          readonly={role === 'manager'}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}