'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, DbUser } from './supabase';
import { colors } from './design-tokens';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Member';
  gymId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: string, gymId?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Session error:', err);
      setLoading(false);
    });

    // Safety timeout: force stop loading after 3 seconds if something hangs
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, []);

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      setUser({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        gymId: data.gym_id,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Fetch user profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) throw userError;

      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        gymId: userData.gym_id,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string, gymId?: string) => {
    try {
      setLoading(true);

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            gym_id: gymId,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile in users table
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email,
          name,
          role,
          gym_id: gymId,
          is_active: true,
        });

        if (profileError) throw profileError;

        setUser({
          id: authData.user.id,
          email,
          name,
          role: role as AuthUser['role'],
          gymId,
        });
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      // Optional: Clear any additional localStorage data if needed
      localStorage.removeItem('userRole');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
