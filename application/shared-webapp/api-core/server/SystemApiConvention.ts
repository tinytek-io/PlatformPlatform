export type PublicApiConvention<
  SystemName extends string,
  ApiVersion extends `v${string}`
> = `/api/${ApiVersion}/${SystemName}`;
export type PrivateApiConvention<SystemName extends string> = `/${SystemName}/api`;
export type InternalApiConvention<SystemName extends string> = `/internal/${SystemName}`;
/**
 * Global API routes that are not system specific and not namespaced!
 */
export type GlobalApiConvention = `/${string}`;
