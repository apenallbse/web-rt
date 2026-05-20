import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { dbService } from '../services/dbService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('skyrt_user');
    if (savedUser) {
      const parsedUser: User = JSON.parse(savedUser);
      // Sync wargaId if email matches a warga in DB
      if (parsedUser.role === 'warga') {
        const warga = dbService.getWarga().find(w => w.email === parsedUser.email);
        if (warga && warga.id !== parsedUser.wargaId) {
          parsedUser.wargaId = warga.id;
          localStorage.setItem('skyrt_user', JSON.stringify(parsedUser));
        }
      }
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password?: string): boolean => {
    // Check if admin - Updated to new admin email
    const isAdminEmail = email === 'admin@skyrt.id';
    const role: UserRole = isAdminEmail ? 'admin' : 'warga';
    
    // For admin, check password if provided
    if (isAdminEmail) {
      const rtProfile = dbService.getRTProfile();
      if (password && rtProfile.password && password !== rtProfile.password) {
        return false;
      }
    }
    
    // Get or Create profile for warga
    let wargaId = undefined;
    let userId = Math.random().toString(36).substr(2, 9);

    if (role === 'warga') {
      const warga = dbService.getOrCreateWarga(email);
      
      // Validate password for warga if it exists
      if (warga.password && password && warga.password !== password) {
        return false;
      }
      
      wargaId = warga.id;
      userId = warga.id; 
    } else if (role === 'admin') {
      userId = 'admin-rt-01'; // Constant ID for admin
    }
    
    const userData: User = {
      id: userId,
      email,
      role,
      wargaId
    };
    setUser(userData);
    localStorage.setItem('skyrt_user', JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skyrt_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
