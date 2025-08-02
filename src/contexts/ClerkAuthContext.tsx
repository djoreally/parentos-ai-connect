
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'Parent' | 'Teacher' | 'Doctor' | 'Admin' | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: any;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerkAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        // Create a profile from Clerk user data
        const userProfile: Profile = {
          id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          role: (user.publicMetadata?.role as Profile['role']) || null,
        };
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    }
  }, [user, isLoaded]);

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signOut }}>
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
