/// <reference path="../environment.d.ts" />

/**
 * This runtime is automatically added as part of the build setup!
 * This file enables runtime environment configuration of the client.
 *
 * Usage:
 * - import.meta.env (contains both build and runtime environments)
 *
 * or split versions
 * - import.meta.build_env
 * - import.meta.runtime_env
 */
const runtimeEnvElement = document.head.getElementsByTagName("meta").namedItem("runtimeEnv");
const userInfoEnvElement = document.head.getElementsByTagName("meta").namedItem("userInfoEnv");
const tenantInfoEnvElement = document.head.getElementsByTagName("meta").namedItem("tenantInfoEnv");

if (runtimeEnvElement == null) throw new Error("Runtime environment is not configured.");

if (userInfoEnvElement == null) throw new Error("UserInfo environment is not configured.");

if (tenantInfoEnvElement == null) throw new Error("TenantInfo environment is not configured.");

try {
  const runtimeEnv: RuntimeEnv = JSON.parse(atob(runtimeEnvElement.content));
  const userInfoEnv: UserInfoEnv = JSON.parse(atob(userInfoEnvElement.content));
  const tenantInfoEnv: TenantInfoEnv = JSON.parse(atob(tenantInfoEnvElement.content));

  const environment = {
    ...import.meta.build_env,
    ...runtimeEnv
  };

  // @ts-expect-error
  window.getApplicationEnvironment = () => ({
    buildEnv: import.meta.build_env,
    runtimeEnv,
    userInfoEnv,
    tenantInfoEnv,
    env: environment
  });
} catch (e) {
  throw new Error("Could not read runtime environment.");
}
