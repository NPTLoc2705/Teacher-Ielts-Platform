import { useAuthContext } from '../contexts/AuthContext';

/** Convenience hook — re-exports AuthContext values */
export function useAuth() {
  return useAuthContext();
}
