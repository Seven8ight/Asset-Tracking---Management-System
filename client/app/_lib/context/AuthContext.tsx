"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { decodeToken, clearTokens, userRolesApi } from "../../../lib/api";
import { getToken } from "@/lib/token";

// This is what the decoded JWT gives us
export type AuthUser = {
  id: string;
  department_id: string | null;
  name: string;
  email: string;
};

type DecodedUser = {
  id: string;
  department_id?: string | null;
  username?: string;
  name?: string;
  email: string;
};

type RolePermission = {
  permissionId: string;
  name: string;
  group_name: string;
  description: string | null;
};

type UserRoleWithPermissions = {
  roleId: string;
  roleName: string;
  roleDescription: string | null;
  permissions: RolePermission[];
};

type UserRolesPermissionsResponse = {
  response?: {
    message?: {
      userId: string;
      roles: UserRoleWithPermissions[];
    };
  };
};

type AuthContextType = {
  accessToken: string | null;
  user: AuthUser | null;
  loading: boolean;
  setUser: Dispatch<SetStateAction<AuthUser | null>>;
  refreshAuth: () => Promise<AuthUser | null>;
  signOut: () => void;
  roles: string[];
  permissions: string[];
  hasPermission: (permission: string | string[]) => boolean;
  initials: string;
};

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  user: null,
  loading: true,
  setUser: () => {},
  refreshAuth: async () => null,
  signOut: () => {},
  roles: [],
  permissions: [],
  hasPermission: () => false,
  initials: "",
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAToken] = useState<string>("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);

  const refreshAuth = async (): Promise<AuthUser | null> => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setRoles([]);
      setPermissions([]);
      return null;
    }

    const decoded = (await decodeToken(token)) as DecodedUser;

    if (!decoded?.id || !decoded?.email)
      throw new Error("Invalid token payload");

    const refreshedUser: AuthUser = {
      id: decoded.id,
      department_id: decoded.department_id ?? null,
      name: decoded.username ?? decoded.name ?? "",
      email: decoded.email,
    };

    setAToken(token);
    setUser(refreshedUser);

    try {
      const roleResponse =
        (await userRolesApi.getMyRolesWithPermissions()) as UserRolesPermissionsResponse;
      const roleList = roleResponse?.response?.message?.roles ?? [];

      const roleNames = roleList.map((role) => role.roleName);
      const permissionNames = Array.from(
        new Set(
          roleList.flatMap((role) =>
            role.permissions.map((permission) => permission.name),
          ),
        ),
      );
      setRoles(roleNames);
      setPermissions(permissionNames);
    } catch {
      setRoles([]);
      setPermissions([]);
    }

    return refreshedUser;
  };

  // On app load, try to restore user from the stored token
  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        await refreshAuth();
      } catch {
        // Invalid/expired token: clear persisted auth state.
        clearTokens();
        setUser(null);
        setRoles([]);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    hydrateAuth();
  }, []);

  const signOut = () => {
    clearTokens();
    setUser(null);
    setRoles([]);
    setPermissions([]);
    window.location.href = "/login";
  };

  const hasPermission = (permission: string | string[]) => {
    if (Array.isArray(permission)) {
      return permission.some((name) => permissions.includes(name));
    }

    return permissions.includes(permission);
  };

  // Generate initials from name e.g "Jane Mwangi" → "JM"
  const initials = user
    ? (user.name || "")
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        loading,
        setUser,
        refreshAuth,
        signOut,
        roles,
        permissions,
        hasPermission,
        initials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component to get the current user
export const useAuth = () => useContext(AuthContext);
