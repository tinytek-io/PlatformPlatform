import type { NavigateOptions } from "@tanstack/react-router";
import type React from "react";
import { createContext, useCallback, useMemo, useRef, useState } from "react";

export type UserInfo = {
  initials: string;
  fullName: string;
} & UserInfoEnv;

export type TenantInfo = TenantInfoEnv;

export const initialUserInfo: UserInfo | null = createUserInfo({ ...import.meta.user_info_env });
const initialTenantInfo = createTenantInfo({ ...import.meta.tenant_info_env });

console.log(initialTenantInfo);
console.log(initialUserInfo);

/**
 * Returns the user info if the user is authenticated or null if logged out
 * If the user data is invalid, it will throw an error
 */
export async function getUserInfo(): Promise<UserInfo | null> {
  try {
    const response = await fetch("/authentication/user-info");
    return createUserInfo(await response.json());
  } catch (error) {
    console.error("Failed to fetch user info", error);
    return null;
  }
}

export async function getTenantInfo(): Promise<TenantInfo | null> {
  try {
    const response = await fetch("/authentication/tenant-info");
    return createTenantInfo(await response.json());
  } catch (error) {
    console.error("Failed to fetch tenant info", error);
    return null;
  }
}

export interface AuthenticationContextType {
  tenantInfo: TenantInfo;
  userInfo: UserInfo | null;
  reloadTenantInfo: () => void;
  reloadUserInfo: () => void;
}

export const authenticationContext = createContext<AuthenticationContextType>({
  tenantInfo: initialTenantInfo,
  userInfo: initialUserInfo,
  reloadTenantInfo: () => {
    throw new Error("No authentication provider found");
  },
  reloadUserInfo: () => {
    throw new Error("No authentication provider found");
  }
});

export interface AuthenticationProviderProps {
  children: React.ReactNode;
  navigate?: (navigateOptions: NavigateOptions) => void;
  afterLogOut?: NavigateOptions["to"];
  afterLogIn?: NavigateOptions["to"];
}

/**
 * Provide authentication context to the application.
 */
export function AuthenticationProvider({ children }: Readonly<AuthenticationProviderProps>) {
  const [tenantInfo, setTenantInfo] = useState<TenantInfoEnv>(initialTenantInfo);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(initialUserInfo);
  const fetching = useRef(false);

  const reloadUserInfo = useCallback(async () => {
    console.log("Reloading user info");
    if (fetching.current) return;
    fetching.current = true;
    try {
      const newUserInfo = await getUserInfo();
      setUserInfo(newUserInfo);
    } catch (error) {
      setUserInfo(null);
    }
    fetching.current = false;
  }, []);

  const reloadTenantInfo = useCallback(async () => {
    console.log("Reloading tenant info");
    if (fetching.current) return;
    fetching.current = true;
    try {
      const newTenantInfo = await getTenantInfo();
      setTenantInfo(newTenantInfo ?? { id: null });
    } catch (error) {
      setTenantInfo({
        id: null
      });
    }
    fetching.current = false;
  }, []);

  const context: AuthenticationContextType = useMemo(
    () => ({
      tenantInfo,
      reloadTenantInfo,
      userInfo,
      reloadUserInfo
    }),
    [tenantInfo, userInfo, reloadTenantInfo, reloadUserInfo]
  );

  return <authenticationContext.Provider value={context}>{children}</authenticationContext.Provider>;
}

function createUserInfo(userInfoEnv: UserInfoEnv): UserInfo | null {
  if (!userInfoEnv.isAuthenticated) {
    return null;
  }
  const { firstName, lastName, email } = userInfoEnv;

  const fullName =
    firstName && lastName ? `${userInfoEnv.firstName} ${userInfoEnv.lastName}` : email?.split("@")[0] ?? "";

  return {
    ...userInfoEnv,
    fullName
  };
}

function createTenantInfo(tenantInfoEnv: TenantInfoEnv): TenantInfo {
  return {
    ...tenantInfoEnv
  };
}
