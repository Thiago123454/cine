import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db, appId } from '../firebase';

export function useProducts(user) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = collection(db, 'artifacts', appId, 'public', 'data', 'cinema_products');
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sorting logic:
      // 1. By 'order' field (ascending)
      // 2. If no 'order', fallback to Category then Name
      items.sort((a, b) => {
        // If both have order, compare order
        if (typeof a.order === 'number' && typeof b.order === 'number') {
          return a.order - b.order;
        }
        // If only a has order, it goes first (or last, depending on preference. Let's say ordered items first)
        if (typeof a.order === 'number') return -1;
        if (typeof b.order === 'number') return 1;

        // Fallback: Default Category/Name sort
        const catA = a.category || 'Varios';
        const catB = b.category || 'Varios';
        const catComparison = catA.localeCompare(catB);
        if (catComparison !== 0) return catComparison;
        return a.name.localeCompare(b.name);
      });

      setProducts(items);
      setLoading(false);
    }, (error) => {
      console.error("Error data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addProduct = async (name, category) => {
    if (!name.trim()) return;
    // New items get a high order number to go to bottom, or 0 if list empty
    const maxOrder = products.length > 0 
      ? Math.max(...products.map(p => p.order || 0)) 
      : 0;

    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'cinema_products'), {
      name,
      category,
      pos1Status: 'ok',
      pos2Status: 'ok',
      order: maxOrder + 100, // Increment by 100 to leave space
      createdAt: serverTimestamp()
    });
  };

  const deleteProduct = async (id) => {
    if (!confirm('¿Borrar producto?')) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'cinema_products', id));
  };

  const cycleStatus = async (id, currentStatus, field) => {
    let next = 'ok';
    if (currentStatus === 'ok') next = 'low';
    else if (currentStatus === 'low') next = 'out';
    
    const ref = doc(db, 'artifacts', appId, 'public', 'data', 'cinema_products', id);
    await updateDoc(ref, {
      [field]: next,
      lastUpdated: serverTimestamp()
    });
  };

  const reorderProducts = async (newItems) => {
    // Optimistic update locally (optional if waiting for snapshot, but good for UI)
    setProducts(newItems);

    const batch = writeBatch(db);
    newItems.forEach((item, index) => {
      const ref = doc(db, 'artifacts', appId, 'public', 'data', 'cinema_products', item.id);
      // Only update if order is different to save writes? 
      // Simplified: Just write all indices to ensure consistency.
      batch.update(ref, { order: index });
    });

    try {
      await batch.commit();
    } catch (e) {
      console.error("Error reordering:", e);
      // Revert is handled by next snapshot update if fail
    }
  };

  return { products, loading, addProduct, deleteProduct, cycleStatus, reorderProducts };
}