import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  switchPersona: (role: 'ADMIN' | 'PROJECT_MANAGER' | 'ENGINEER' | 'DESIGNER') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 'demo-engineer',
    email: 'engineer@autoengine.io',
    firstName: 'Dr. Sarah',
    lastName: 'Chen',
    role: 'ENGINEER',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('autoengine_token'));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('autoengine_token');
      if (storedToken) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          }
        } catch (e) {
          console.warn('Backend offline or token expired, using offline persona demo.');
        }
      }
    };
    fetchUser();
  }, []);

  const switchPersona = async (role: 'ADMIN' | 'PROJECT_MANAGER' | 'ENGINEER' | 'DESIGNER') => {
    setIsLoading(true);
    try {
      const res = await api.auth.switchPersona(role);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('autoengine_token', res.token);
      }
    } catch (e) {
      // Fallback local personas if backend is disconnected
      const personas: Record<string, User> = {
        ADMIN: {
          id: 'admin-id',
          email: 'admin@autoengine.io',
          firstName: 'Elena',
          lastName: 'Vance',
          role: 'ADMIN',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        },
        PROJECT_MANAGER: {
          id: 'pm-id',
          email: 'pm@autoengine.io',
          firstName: 'Marcus',
          lastName: 'Thorne',
          role: 'PROJECT_MANAGER',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        },
        ENGINEER: {
          id: 'eng-id',
          email: 'engineer@autoengine.io',
          firstName: 'Dr. Sarah',
          lastName: 'Chen',
          role: 'ENGINEER',
          avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
        },
        DESIGNER: {
          id: 'des-id',
          email: 'designer@autoengine.io',
          firstName: 'Julian',
          lastName: 'Rossi',
          role: 'DESIGNER',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
        },
      };
      setUser(personas[role] || personas.ENGINEER);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('autoengine_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, switchPersona, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
