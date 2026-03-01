import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
    const { user, firebaseUser, isLoading, isAuthenticated, role } = useAuthContext();
    return { user, firebaseUser, isLoading, isAuthenticated, role };
}
