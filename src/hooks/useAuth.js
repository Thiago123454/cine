import { useState, useEffect } from 'react';
import { 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { auth } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [managerName, setManagerName] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    return onAuthStateChanged(auth, setUser);
  }, []);

  const loginManager = (username, password) => {
    const u = username.toLowerCase().trim();
    const p = password.trim();

    if ((u === 'thiago' && p === 'river') || (u === 'fiorella' && p === 'river')) {
      setRole('manager');
      setManagerName(u.charAt(0).toUpperCase() + u.slice(1));
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole(null);
    setManagerName('');
  };

  return { user, role, setRole, managerName, loginManager, logout };
}