"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { AuthProvider, AuthUser, useAuth } from "./AuthContext";
import { userApi } from "@/lib/api";

type AdminDepartmentContextType = {
  // null = admin is viewing their own department (default / normal view)
  viewingDepartmentId: string | null;
  setViewingDepartmentId: (id: string | null) => void;
};

const AdminDepartmentContext = createContext<
  AdminDepartmentContextType | undefined
>(undefined);

export default function AdminDepartmentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [viewingDepartmentId, setViewingDepartmentId] = useState<string | null>(
      null,
    ),
    { setUser } = useAuth();

  useEffect(() => {
    setUser((current) => ({
      ...(current as AuthUser),
      department_id: viewingDepartmentId,
    }));

    const switchDepartment = async () => {
      if (viewingDepartmentId != null)
        await userApi.switch(viewingDepartmentId!);
    };

    switchDepartment();
  }, [viewingDepartmentId]);

  return (
    <AdminDepartmentContext.Provider
      value={{ viewingDepartmentId, setViewingDepartmentId }}
    >
      {children}
    </AdminDepartmentContext.Provider>
  );
}

export function useAdminDepartment() {
  const ctx = useContext(AdminDepartmentContext);
  if (!ctx) {
    throw new Error(
      "useAdminDepartment must be used within an AdminDepartmentProvider",
    );
  }
  return ctx;
}
