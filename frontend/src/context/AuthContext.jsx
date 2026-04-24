import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;
const TOKEN_STORAGE_KEY = 'agrivision_auth_token';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Session expired');
        }

        const user = await response.json();
        setCurrentUser(user);
      } catch (error) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        return { success: false, error: loginData.detail || 'Invalid username or password' };
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, loginData.access_token);

      const userResponse = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${loginData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to load account');
      }

      const user = await userResponse.json();
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Invalid username or password' };
    }
  };

  const register = async (username, password) => {
    if (!username || !password) {
        return { success: false, error: 'Please fill in all fields' };
    }

    try {
      const registerResponse = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        return { success: false, error: registerData.detail || 'Unable to create account' };
      }

      return await login(username, password);
    } catch (error) {
      return { success: false, error: 'Unable to connect to the server' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
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
