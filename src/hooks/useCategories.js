import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, appId } from '../firebase';

export function useCategories() {
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // LISTA POR DEFECTO: Helados eliminado
  const defaultCategories = ['Snacks', 'Bebidas', 'Dulces', 'Descartables'];

  useEffect(() => {
    // Referencia a la colección de categorías
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'cinema_categories'), 
      orderBy('name')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomCategories(cats);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching categories:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addCategory = async (name) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    // Evitar duplicados simples con las por defecto
    const isDefault = defaultCategories.some(c => c.toLowerCase() === cleanName.toLowerCase());
    if (isDefault) {
      alert('Esta categoría ya existe por defecto.');
      return;
    }

    // Verificar si ya existe en las custom
    const exists = customCategories.some(c => c.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      alert('Esta categoría ya fue creada.');
      return;
    }

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'cinema_categories'), {
        name: cleanName,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error adding category:", e);
      alert("Error al guardar la categoría");
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'cinema_categories', id));
    } catch (e) {
      console.error("Error deleting category:", e);
    }
  };

  // Combinar y desduplicar para la UI
  const allCategories = [
    ...defaultCategories, 
    ...customCategories.map(c => c.name)
  ];

  return { 
    categories: allCategories, 
    customCategories, 
    loading, 
    addCategory, 
    deleteCategory 
  };
}