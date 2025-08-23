import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as api from "../api";
import Cookies from "js-cookie";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [bootstrapping, setBootstrapping] = useState<boolean>(true);

  // Basic global unauthorized handler
  const handleUnauthorized = () => {
    setUser(null);
    setToken(null);
    try {
      Cookies.remove("token");
      Cookies.remove("userEmail");
      Cookies.remove("userName");
    } catch { }
  };

  useEffect(() => {
    // Hydrate token from cookies and fetch profile
    const t = Cookies.get("token");
    const hydrate = async () => {
      try {
        if (!t) return;
        setToken(t);
        const me = await api.getMe();
        setUser({ id: me.id, email: me.email, name: me.email.split('@')[0] });
      } catch (e: any) {
        // invalid token
        handleUnauthorized();
      } finally {
        setBootstrapping(false);
      }
    };
    hydrate();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const t = await api.login(email, password);
      Cookies.set("token", t, { expires: 7 });
      setToken(t);
      const me = await api.getMe();
      setUser({ id: me.id, email: me.email, name: me.email.split('@')[0] });
      return true;
    } catch (e: any) {
      // Optionally integrate your toast system here
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      Cookies.remove("token");
      Cookies.remove("userEmail");
      Cookies.remove("userName");
    } catch { }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!token && user !== null
  };

  if (bootstrapping) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};