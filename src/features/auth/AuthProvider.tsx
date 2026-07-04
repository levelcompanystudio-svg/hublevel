import React, { createContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import type { AuthContextType, UserProfile } from './auth.types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*, roles(name, description)')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        setProfile(null);
        setError('Perfil de usuário não encontrado no banco de dados.');
        return null;
      }

      const userProfile: UserProfile = {
        id: data.id,
        role_id: data.role_id,
        name: data.name,
        email: data.email,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
        roles: data.roles ? {
          name: data.roles.name,
          description: data.roles.description,
        } : undefined,
      };

      setProfile(userProfile);
      setError(null);
      return userProfile;
    } catch (err: unknown) {
      console.error('Error fetching user profile:', err);
      const message = err instanceof Error ? err.message : 'Erro ao carregar o perfil do usuário.';
      setError(message);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          if (isMounted) {
            setUser(session.user);
          }
          await fetchProfile(session.user.id);
        } else {
          if (isMounted) {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err: unknown) {
        console.error('Error initializing auth session:', err);
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Erro ao inicializar sessão de autenticação.';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      setLoading(true);
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setError(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
    } catch (err: unknown) {
      console.error('Error in signIn:', err);
      const message = err instanceof Error ? err.message : 'Erro ao realizar login.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setUser(null);
      setProfile(null);
      setError(null);
    } catch (err: unknown) {
      console.error('Error signing out:', err);
      const message = err instanceof Error ? err.message : 'Erro ao encerrar a sessão.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
