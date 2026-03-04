import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

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

  // Simple login function using lastName and phone
  const login = async (lastName, phone) => {
    try {
      // Normalize: Title Case for lastName, trim both
      const normalizedLastName = lastName.trim().split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      const normalizedPhone = phone.trim();

      // Query Firestore to find matching user
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('lastName', '==', normalizedLastName),
        where('phone', '==', normalizedPhone)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { success: false, error: 'No user found with these credentials' };
      }
      
      // Get the first matching user
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
    localStorage.removeItem('alumni_user');
  };

  const value = {
    currentUser,
    login,
    logout,
    loading,
    setCurrentUser
  };

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('alumni_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};