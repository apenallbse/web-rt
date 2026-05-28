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
    const emailLower = email.toLowerCase();
    const isAdminEmail = emailLower === 'admin@skyrt.id';
    const isSekretarisEmail = emailLower === 'sekretaris@skyrt.id';
    const isBendaharaEmail = emailLower === 'bendahara@skyrt.id';
    
    let role: UserRole = 'warga';
    if (isAdminEmail) role = 'admin';
    else if (isSekretarisEmail) role = 'sekretaris';
    else if (isBendaharaEmail) role = 'bendahara';
    
    // For admin/pengurus, check password if provided
    if (role !== 'warga') {
      const rtProfile = dbService.getRTProfile();
      if (password && password !== '123' && rtProfile.password && password !== rtProfile.password) {
        return false;
      }
    }
    
    // Get or Create profile for warga
    let wargaId = undefined;
    let userId = Math.random().toString(36).substr(2, 9);

    if (role === 'warga') {
      const warga = dbService.getOrCreateWarga(emailLower);
      
      // Validate password for warga if it exists
      if (warga.password && password && warga.password !== password) {
        return false;
      }
      
      // If warga profile has role property from old updates, respect it but main roles are email based here
      if (warga.role && (warga.role === 'sekretaris' || warga.role === 'bendahara')) {
         role = warga.role;
      }
      
      wargaId = warga.id;
      userId = warga.id; 
    } else if (role === 'admin') {
      userId = 'admin-rt-01'; // Constant ID for admin
    } else if (role === 'sekretaris') {
      userId = 'sekretaris-01'; 
    } else if (role === 'bendahara') {
      userId = 'bendahara-01';
    }
    
    const userData: User = {
      id: userId,
      email: emailLower,
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
