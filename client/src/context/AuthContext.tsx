import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isGuest: boolean;
  isLoading: boolean;
  continueAsGuest: () => void;
  loginWithUser: (user: User, token?: string, rememberMe?: boolean) => void;
  switchPersona: (role: 'ADMIN' | 'PROJECT_MANAGER' | 'ENGINEER' | 'DESIGNER' | 'CUSTOMER') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('autoengine_user') || sessionStorage.getItem('autoengine_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('autoengine_token') || sessionStorage.getItem('autoengine_token');
  });

  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('autoengine_is_guest') === 'true';
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const activeToken = localStorage.getItem('autoengine_token') || sessionStorage.getItem('autoengine_token');
      if (activeToken) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            setIsGuest(false);
            if (localStorage.getItem('autoengine_token')) {
              localStorage.setItem('autoengine_user', JSON.stringify(res.user));
            } else {
              sessionStorage.setItem('autoengine_user', JSON.stringify(res.user));
            }
          }
        } catch (e) {
          console.warn('Backend verification failed, using persistent session.');
        }
      }
    };
    fetchUser();
  }, []);

  const continueAsGuest = () => {
    setUser(null);
    setToken(null);
    setIsGuest(true);
    localStorage.setItem('autoengine_is_guest', 'true');
    localStorage.removeItem('autoengine_token');
    localStorage.removeItem('autoengine_user');
    sessionStorage.removeItem('autoengine_token');
    sessionStorage.removeItem('autoengine_user');
  };

  const loginWithUser = (userData: User, userToken?: string, rememberMe: boolean = true) => {
    setUser(userData);
    setIsGuest(false);
    localStorage.removeItem('autoengine_is_guest');

    if (userToken) {
      setToken(userToken);
      if (rememberMe) {
        localStorage.setItem('autoengine_token', userToken);
        localStorage.setItem('autoengine_user', JSON.stringify(userData));
        sessionStorage.removeItem('autoengine_token');
        sessionStorage.removeItem('autoengine_user');
      } else {
        sessionStorage.setItem('autoengine_token', userToken);
        sessionStorage.setItem('autoengine_user', JSON.stringify(userData));
        localStorage.removeItem('autoengine_token');
        localStorage.removeItem('autoengine_user');
      }
    } else {
      if (rememberMe) {
        localStorage.setItem('autoengine_user', JSON.stringify(userData));
      } else {
        sessionStorage.setItem('autoengine_user', JSON.stringify(userData));
      }
    }
  };

  const switchPersona = async (role: 'ADMIN' | 'PROJECT_MANAGER' | 'ENGINEER' | 'DESIGNER' | 'CUSTOMER') => {
    setIsLoading(true);
    try {
      const res = await api.auth.switchPersona(role);
      if (res.success && res.user) {
        loginWithUser(res.user, res.token, true);
      }
    } catch (e) {
      // Fallback local personas if backend is disconnected
      const personas: Record<string, User> = {
        ADMIN: {
          id: 'siddharth-admin',
          email: 'siddharth@autoengine.io',
          firstName: 'Siddharth',
          lastName: 'Admin',
          role: 'ADMIN',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        },
        CUSTOMER: {
          id: 'customer-id',
          email: 'customer@autoengine.io',
          firstName: 'Alex',
          lastName: 'Morgan',
          role: 'CUSTOMER',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
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
      const fallbackUser = personas[role] || personas.CUSTOMER;
      loginWithUser(fallbackUser, undefined, true);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('autoengine_token');
    localStorage.removeItem('autoengine_user');
    localStorage.removeItem('autoengine_is_guest');
    sessionStorage.removeItem('autoengine_token');
    sessionStorage.removeItem('autoengine_user');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isGuest,
        isLoading,
        continueAsGuest,
        loginWithUser,
        switchPersona,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
