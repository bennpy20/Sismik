
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { signOut } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem('sismik_session');
    if (savedSession) {
      setUser(JSON.parse(savedSession));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    // Simulasi delay jaringan
    await new Promise(r => setTimeout(r, 800));
    const users = JSON.parse(localStorage.getItem('sismik_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === pass);
    
    if (foundUser) {
      const userData: User = { 
        id: foundUser.id, 
        name: foundUser.name, 
        email: foundUser.email,
        provider: 'local'
      };
      setUser(userData);
      localStorage.setItem('sismik_session', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    const users = JSON.parse(localStorage.getItem('sismik_users') || '[]');
    if (users.some((u: any) => u.email === email)) return false;

    const newUser = { id: crypto.randomUUID(), name, email, password: pass };
    users.push(newUser);
    localStorage.setItem('sismik_users', JSON.stringify(users));
    return true;
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userData: User = {
        id: user.uid,
        name: user.displayName || "Google User",
        email: user.email || "",
        avatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`,
        provider: "google"
      };

      setUser(userData);
      localStorage.setItem("sismik_session", JSON.stringify(userData));
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem('sismik_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
