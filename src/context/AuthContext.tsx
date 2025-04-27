
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Profile = {
  id: string;
  full_name: string;
  student_id: string;
  phone_number?: string;
  hostel_details?: string;
  avatar_url?: string;
};

// Extended user info with camelCase properties for component use
export type UserInfo = User & {
  fullName?: string;
  studentId?: string;
  phoneNumber?: string;
  hostelDetails?: string;
  profileImage?: string;
};

type AuthContextType = {
  user: UserInfo | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
};

type RegisterData = {
  full_name: string;
  email: string;
  password: string;
  student_id: string;
  phone_number?: string;
  hostel_details?: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ? {...session.user} : null);
        
        if (session?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? {...session.user} : null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    setIsLoading(false);
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
    
    // Update the user object with profile data in camelCase format
    setUser(prevUser => {
      if (!prevUser) return null;
      
      return {
        ...prevUser,
        fullName: data.full_name,
        studentId: data.student_id,
        phoneNumber: data.phone_number,
        hostelDetails: data.hostel_details,
        profileImage: data.avatar_url,
      };
    });
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email.endsWith('@rguktrkv.ac.in')) {
        toast.error('Please use your RGUKT RK Valley email address');
        return false;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success('Welcome back!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      if (!userData.email.endsWith('@rguktrkv.ac.in')) {
        toast.error('Please use your RGUKT RK Valley email address');
        return false;
      }

      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            student_id: userData.student_id,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success('Registration successful!');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out');
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    try {
      if (!user) return false;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      // Update the user object with the new profile data in camelCase format
      setUser(prevUser => {
        if (!prevUser) return null;
        
        return {
          ...prevUser,
          fullName: updates.full_name || prevUser.fullName,
          studentId: updates.student_id || prevUser.studentId,
          phoneNumber: updates.phone_number || prevUser.phoneNumber,
          hostelDetails: updates.hostel_details || prevUser.hostelDetails,
          profileImage: updates.avatar_url || prevUser.profileImage,
        };
      });
      
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
      return false;
    }
  };

  const value = {
    user,
    profile,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
