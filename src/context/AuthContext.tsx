
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

type User = {
  id: string;
  fullName: string;
  email: string;
  studentId: string;
  phoneNumber?: string;
  hostelDetails?: string;
  profileImage?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => void;
};

type RegisterData = {
  fullName: string;
  email: string;
  password: string;
  studentId: string;
  phoneNumber?: string;
  hostelDetails?: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('campusMarketUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('campusMarketUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes only - validate IIIT RK Valley domain
      if (!email.endsWith('@iiitrkvalley.ac.in')) {
        toast.error("Only IIIT RK Valley email addresses are allowed.");
        return false;
      }

      // In a real app, you would validate credentials against a backend
      // For now, simulate successful login with mock data
      const mockUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        fullName: email.split('@')[0].replace(/[.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        email: email,
        studentId: 'RK' + Math.floor(100000 + Math.random() * 900000).toString(),
        profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`
      };
      
      setUser(mockUser);
      localStorage.setItem('campusMarketUser', JSON.stringify(mockUser));
      toast.success("Login successful!");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validate IIIT RK Valley domain
      if (!userData.email.endsWith('@iiitrkvalley.ac.in')) {
        toast.error("Only IIIT RK Valley email addresses are allowed.");
        return false;
      }
      
      // In a real app, you would register with a backend
      // For now, simulate successful registration
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        fullName: userData.fullName,
        email: userData.email,
        studentId: userData.studentId,
        phoneNumber: userData.phoneNumber,
        hostelDetails: userData.hostelDetails,
        profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName)}&background=random`
      };
      
      setUser(newUser);
      localStorage.setItem('campusMarketUser', JSON.stringify(newUser));
      toast.success("Registration successful!");
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('campusMarketUser');
    toast.info("You have been logged out.");
  };
  
  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('campusMarketUser', JSON.stringify(updatedUser));
      toast.success("Profile updated successfully!");
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
