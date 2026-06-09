'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';

const CACHE_KEY = 'gaulgym_user';

interface DbUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface PostgrestError {
  code?: string;
  message?: string;
}

// M-9: Single canonical AuthUser definition, exported for reuse
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Member';
  emailConfirmedAt?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Read cached user from localStorage instantly (no async)
function getCachedUser(): AuthUser | null {
  // Disabled local storage caching for security (Issue #4)
  return null;
}

function setCachedUser(user: AuthUser | null) {
  // Disabled local storage caching for security (Issue #4)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize from cache so there's NO flash on page load
  const [user, setUser] = useState<AuthUser | null>(getCachedUser);
  const [loading, setLoading] = useState(!getCachedUser());

  // Wrapper that also updates cache
  const setUserAndCache = useCallback((u: AuthUser | null) => {
    setUser(u);
    setCachedUser(u);
  }, []);

  // H-5: Use useCallback to prevent stale closures on fetchUserProfile
  const fetchUserProfile = useCallback(async (userId: string, emailConfirmedAt: string | null = null, retries = 3) => {
    try {
      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout fetching user profile')), 5000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as { data: DbUser | null; error: PostgrestError | null };

      if (error || !data) {
        if (error?.code === 'PGRST116' && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchUserProfile(userId, emailConfirmedAt, retries - 1);
        }
        // If it's a timeout or network error, don't throw, just exit and use cache
        if (error?.message?.includes('Timeout') || error?.message?.includes('network') || error?.message?.includes('fetch')) {
          console.warn('Network/Timeout error fetching profile, using cache instead:', error);
          return;
        }
        throw error || new Error('User data not found');
      }

      if (data) {
        setUserAndCache({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as AuthUser['role'],
          emailConfirmedAt: emailConfirmedAt,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Only force logout if the user was actually deleted or session is completely invalid
      // Otherwise, we let them keep using the cached session
    } finally {
      setLoading(false);
    }
  }, [setUserAndCache]);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email_confirmed_at || null);
      } else {
        // No session = clear cache too
        setUserAndCache(null);
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Session error:', err);
      setUserAndCache(null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') return; // Let getSession handle the initial load to prevent race conditions

      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email_confirmed_at || null);
      } else {
        setUserAndCache(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData?.user) throw new Error(authError?.message || 'Login gagal atau user tidak ditemukan');

      // S-8: Check email verification status and warn if not verified
      if (!authData.user.email_confirmed_at) {
        console.warn('User email is not verified yet. Allowing login but flagging.');
      }

      const { data: initialUserData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      let userData = initialUserData;

      if (userError || !userData) {
        await supabase.auth.signOut();
        return { success: false, error: 'Akun tidak ditemukan. Hubungi admin untuk aktivasi.' };
      }

      // H-15/M-16: Do NOT auto-assign members to arbitrary first gym.
      // If a Member has no members record, log a warning but don't auto-assign to random gym.
      if (userData?.role === 'Member') {
         const { data: memberData } = await supabase.from('members').select('id').eq('user_id', authData.user.id).single();
         if (!memberData) {
           console.warn('Member has no members record. They need to be assigned to a gym by an admin.');
           // Do not auto-assign to arbitrary gym - this is a data integrity issue
         }
      }

      const authUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role as AuthUser['role'],
        emailConfirmedAt: authData.user.email_confirmed_at || null,
      };
      setUserAndCache(authUser);

      // Set cookie for middleware
      document.cookie = `x-user-role-cache=${encodeURIComponent(JSON.stringify({
        role: authUser.role,
        ts: Date.now()
      }))}; path=/; max-age=86400; SameSite=Lax`;
      // S-8: Return warning about email verification
      const warnings: string[] = [];
      if (!authData.user.email_confirmed_at) {
        warnings.push('Email Anda belum terverifikasi. Silakan periksa inbox email Anda.');
      }

      return { success: true, user: authUser, ...(warnings.length > 0 ? { warning: warnings.join(' ') } : {}) };
    } catch (error: unknown) {
      setLoading(false);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // M-2: Allow the role parameter to be used if provided, with validation
  const register = async (name: string, email: string, password: string, role: string = 'Member') => {
    try {
      setLoading(true);

      // M-2: Validate the role - only allow 'Member' for self-registration
      const allowedRoles = ['Member'];
      const finalRole = allowedRoles.includes(role) ? role : 'Member';

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: finalRole,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {

        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email,
          name,
          role: finalRole,
          is_active: true,
        });

        if (profileError) throw profileError;

        // M-16: Auto-create member record without gymId scoping
        const randomBytes = new Uint8Array(4);
        crypto.getRandomValues(randomBytes);
        const displayId = 'GG-' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 6).toUpperCase();
        await supabase.from('members').insert({
          user_id: authData.user.id,
          name,
          email,
          display_id: displayId,
          join_date: new Date().toISOString().split('T')[0]
        });

        const authUser: AuthUser = {
          id: authData.user.id,
          email,
          name,
          role: finalRole as AuthUser['role'],
          emailConfirmedAt: authData.user.email_confirmed_at || null,
        };
        setUserAndCache(authUser);
        // Set cookie for middleware
        document.cookie = `x-user-role-cache=${encodeURIComponent(JSON.stringify({
          role: authUser.role,
          ts: Date.now()
        }))}; path=/; max-age=86400; SameSite=Lax`;
        return { success: true, user: authUser };
      }

      return { success: true };
    } catch (error: unknown) {
      setLoading(false);
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUserAndCache(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, loading }}>
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
