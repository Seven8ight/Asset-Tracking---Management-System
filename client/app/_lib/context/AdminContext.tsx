"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { AuthUser, useAuth } from "./AuthContext";
import { saveTokens, userApi } from "@/lib/api";

type AdminDepartmentContextType = {
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
    { setUser, user } = useAuth();

  useEffect(() => {
    setViewingDepartmentId(user?.department_id ?? null);
  }, [user]);

  useEffect(() => {
    const switchDepartment = async () => {
      if (viewingDepartmentId != null) {
        if (viewingDepartmentId != user?.department_id) {
          const update = await userApi.switch(viewingDepartmentId!);

          saveTokens(
            update.response.message.accessToken,
            update.response.message.refreshToken,
          );

          setUser((current) => ({
            ...(current as AuthUser),
            department_id: viewingDepartmentId,
          }));
        }
      }
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
