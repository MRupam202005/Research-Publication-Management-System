import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { login as loginRequest, register as registerRequest } from '@/services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedToken = window.localStorage.getItem('rps_token');
    const storedUser = window.localStorage.getItem('rps_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    const data = await loginRequest(email, password);
    setUser(data.user);
    setToken(data.token);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('rps_token', data.token);
      window.localStorage.setItem('rps_user', JSON.stringify(data.user));
    }
    router.push('/dashboard');
  };

  const handleRegister = async (name, email, password, role) => {
    const data = await registerRequest(name, email, password, role);
    setUser(data.user);
    setToken(data.token);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('rps_token', data.token);
      window.localStorage.setItem('rps_user', JSON.stringify(data.user));
    }
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('rps_token');
      window.localStorage.removeItem('rps_user');
    }
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

