import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { hybridAPI, supabaseService } from '../services/api';
import { AuthState, User } from '../types';

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
      };
    case 'LOGOUT':
      return { user: null, token: null, isLoading: false };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check for current user session
    const checkUser = async () => {
      try {
        const { user, profile } = await supabaseService.getCurrentUser();
        
        if (user && profile) {
          const userData: User = {
            id: profile.id,
            email: profile.email,
            firstName: profile.first_name,
            lastName: profile.last_name,
            phone: profile.phone,
            role: profile.role,
            createdAt: profile.created_at,
          };

          dispatch({
            type: 'SET_USER',
            payload: {
              user: userData,
              token: user.access_token || 'supabase-session',
            },
          });
        } else {
          // Fallback to localStorage for Django sessions
          const storedToken = localStorage.getItem('hospital_token');
          const storedUser = localStorage.getItem('hospital_user');
          
          if (storedToken && storedUser) {
            dispatch({
              type: 'SET_USER',
              payload: {
                user: JSON.parse(storedUser),
                token: storedToken,
              },
            });
          } else {
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await hybridAPI.login(email, password);
      
      let userData: User;
      let token: string;

      if (result.profile) {
        // Supabase response
        userData = {
          id: result.profile.id,
          email: result.profile.email,
          firstName: result.profile.first_name,
          lastName: result.profile.last_name,
          phone: result.profile.phone,
          role: result.profile.role,
          createdAt: result.profile.created_at,
        };
        token = result.session?.access_token || 'supabase-session';
      } else {
        // Django API response
        userData = result.user;
        token = result.access_token;
        
        // Store in localStorage for Django sessions
        localStorage.setItem('hospital_token', token);
        localStorage.setItem('hospital_user', JSON.stringify(userData));
      }
      
      dispatch({
        type: 'SET_USER',
        payload: { user: userData, token },
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (userData: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await hybridAPI.register(userData);
      
      let user: User;
      let token: string;

      if (result.user) {
        // Supabase response
        const { data: profile } = await supabaseService.getCurrentUser();
        
        if (profile?.profile) {
          user = {
            id: profile.profile.id,
            email: profile.profile.email,
            firstName: profile.profile.first_name,
            lastName: profile.profile.last_name,
            phone: profile.profile.phone,
            role: profile.profile.role,
            createdAt: profile.profile.created_at,
          };
          token = result.session?.access_token || 'supabase-session';
        } else {
          throw new Error('Profile creation failed');
        }
      } else {
        // Django API response
        user = result.user;
        token = result.access_token;
        
        localStorage.setItem('hospital_token', token);
        localStorage.setItem('hospital_user', JSON.stringify(user));
      }
      
      dispatch({
        type: 'SET_USER',
        payload: { user, token },
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    // Sign out from Supabase
    supabaseService.signOut().catch(console.error);
    
    // Clear localStorage
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_user');
    
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout }}>
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