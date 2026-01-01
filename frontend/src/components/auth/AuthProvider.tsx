'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setFirebaseUser, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Reload user to get latest email verification status
        try {
          await firebaseUser.reload();
        } catch (error) {
          console.error('Error reloading user:', error);
        }
        
        try {
          // Fetch user data from backend
          const response = await authAPI.getMe(firebaseUser.uid);
          setUser(response.data);
        } catch (error: any) {
          // 404 means user hasn't completed onboarding yet - this is expected for new users
          if (error.response?.status !== 404) {
            console.error('Error fetching user data:', error);
          }
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setFirebaseUser, setUser, setLoading]);

  return <>{children}</>;
}

