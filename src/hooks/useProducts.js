import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
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
      
      items.sort((a, b) => {
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
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'cinema_products'), {
      name,
      category,
      pos1Status: 'ok',
      pos2Status: 'ok',
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

  return { products, loading, addProduct, deleteProduct, cycleStatus };
}