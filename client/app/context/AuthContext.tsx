"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { decodeToken, clearTokens, getToken } from "../../lib/api";

// This is what the decoded JWT gives us
export type AuthUser = {
  id: string;
  department_id: string | null;
  name: string;
  email: string;
  phone: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  signOut: () => void;
  // initials derived from name
  initials: string;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  signOut: () => {},
  initials: "",
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On app load, try to restore user from the stored token
  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser({
          id: decoded.id,
          department_id: decoded.department_id ?? null,
          name: decoded.name,
          email: decoded.email,
          phone: decoded.phone,
        });
      }
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    clearTokens();
    setUser(null);
    window.location.href = "/login";
  };

  // Generate initials from name e.g "Jane Mwangi" → "JM"
  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <AuthContext.Provider value={{ user, loading, setUser, signOut, initials }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component to get the current user
export const useAuth = () => useContext(AuthContext);