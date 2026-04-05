import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { saveSession, loadSession, clearSession } from '../utils/session';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (lastName, phone) => {
    try {
      const normalizedLastName = lastName.trim().split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      const normalizedPhone = phone.trim();

      const q = query(
        collection(db, 'users'),
        where('lastName', '==', normalizedLastName),
        where('phone', '==', normalizedPhone)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false, error: 'No user found with these credentials' };
      }

      const userDoc = querySnapshot.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() };
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    clearSession('alumni_user');
  };

  useEffect(() => {
    const userData = loadSession('alumni_user');
    if (userData) {
      setCurrentUser(userData);
    }
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    loading,
    setCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
