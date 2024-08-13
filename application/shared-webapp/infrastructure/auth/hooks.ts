import { useContext } from "react";
import { authenticationContext } from "./AuthenticationProvider";

/**
 * Get the authentication context.
 */
export function useAuthentication() {
  const context = useContext(authenticationContext);
  if (!context) throw new Error("useAuthentication must be used within an AuthenticationProvider");

  return context;
}

/**
 * Get the current user info.
 */
export function useUserInfo() {
  const { userInfo } = useAuthentication();
  if (userInfo?.isAuthenticated) {
    return userInfo;
  }
  return null;
}

/**
 * Return true if the current user is logged in.
 */
export function useIsAuthenticated() {
  return useUserInfo() != null;
}

/**
 * Return the current user role. If the user is not logged in, return null.
 */
export function useUserRole() {
  return useUserInfo()?.role ?? null;
}

/**
 * Get the current tenant info.
 */
export function useTenantInfo() {
  const { tenantInfo } = useAuthentication();
  if (tenantInfo.id) {
    return tenantInfo;
  }
  return null;
}
