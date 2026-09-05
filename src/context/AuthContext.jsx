import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEMO_USERS } from '../services/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Supabase Auth listener
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Mock Auth initialization (Default to Admin user for full access)
      const savedUser = localStorage.getItem('pos_current_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          setUser(DEMO_USERS.admin);
        }
      } else {
        setUser(DEMO_USERS.admin);
      }
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error || !data) {
        const detectedRole = authUser.user_metadata?.role || (authUser.email?.includes('admin') ? 'admin' : 'cashier');
        const detectedName = authUser.user_metadata?.full_name || (detectedRole === 'admin' ? 'Alex Morgan (Admin)' : 'David Miller (Cashier)');
        
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          full_name: detectedName,
          role: detectedRole
        };
        
        // Attempt upserting profile record into user_profiles table
        await supabase.from('user_profiles').upsert([newProfile]);
        setUser(newProfile);
      } else {
        setUser(data);
      }
    } catch (e) {
      console.error('Profile fetch error:', e);
      setUser({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.email?.split('@')[0] || 'Staff',
        role: 'admin'
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, roleChoice = 'admin') => {
    if (isSupabaseConfigured && supabase) {
      // 1. Attempt standard Supabase Auth login
      let { data, error } = await supabase.auth.signInWithPassword({ email, password });

      // 2. If user does not exist in new Supabase project, auto-register the account
      if (error) {
        console.log('User not found in Supabase Auth. Registering new user account...');
        const targetRole = email.toLowerCase().includes('cashier') ? 'cashier' : roleChoice;
        const targetName = targetRole === 'admin' ? 'Alex Morgan (Admin)' : 'David Miller (Cashier)';

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: password || 'password123',
          options: {
            data: {
              full_name: targetName,
              role: targetRole
            }
          }
        });

        if (signUpError) {
          console.warn('Supabase auto-signup error:', signUpError.message, 'Falling back to demo user state.');
          const selectedUser = targetRole === 'cashier' ? DEMO_USERS.cashier : DEMO_USERS.admin;
          setUser(selectedUser);
          localStorage.setItem('pos_current_user', JSON.stringify(selectedUser));
          return { user: selectedUser };
        }

        data = signUpData;
        if (signUpData?.user) {
          fetchUserProfile(signUpData.user);
        }
      }
      return data;
    } else {
      // Mock Login
      let targetRole = roleChoice;
      if (email && email.toLowerCase().includes('cashier')) {
        targetRole = 'cashier';
      } else if (email && email.toLowerCase().includes('admin')) {
        targetRole = 'admin';
      }
      const selectedUser = targetRole === 'cashier' ? DEMO_USERS.cashier : DEMO_USERS.admin;
      setUser(selectedUser);
      localStorage.setItem('pos_current_user', JSON.stringify(selectedUser));
      return { user: selectedUser };
    }
  };

  const switchRole = (role) => {
    const newUser = role === 'admin' ? DEMO_USERS.admin : DEMO_USERS.cashier;
    setUser(newUser);
    localStorage.setItem('pos_current_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      setUser(null);
      localStorage.removeItem('pos_current_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchRole, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
