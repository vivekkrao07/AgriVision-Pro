import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('agrivision_current_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem('agrivision_users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('agrivision_current_user', JSON.stringify(user));
      return { success: true };
    } else {
      return { success: false, error: 'Invalid username or password' };
    }
  };

  const register = (username, password) => {
    if (!username || !password) {
        return { success: false, error: 'Please fill in all fields' };
    }

    const users = JSON.parse(localStorage.getItem('agrivision_users') || '[]');
    const existingUser = users.find(u => u.username === username);
    
    if (existingUser) {
      return { success: false, error: 'Username already exists' };
    }
    
    const newUser = { username, password };
    users.push(newUser);
    localStorage.setItem('agrivision_users', JSON.stringify(users));
    
    setCurrentUser(newUser);
    localStorage.setItem('agrivision_current_user', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('agrivision_current_user');
  };

  const value = {
    currentUser,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
