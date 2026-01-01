import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

interface User {
  id: number;
  firebase_uid: string;
  email: string;
  first_name: string;
  date_of_birth: string;
  gender: string;
  country: string;
  state: string;
  city?: string;
  profile_picture_url: string;
  tribe_id: string;
  state_visibility_enabled: boolean;
  created_at: string;
}

interface AuthStore {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  firebaseUser: null,
  user: null,
  loading: true,
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ firebaseUser: null, user: null }),
}));

