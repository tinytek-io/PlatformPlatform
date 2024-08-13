import { edenFetch } from "@elysiajs/eden";
import { signInPath } from "@repo/infrastructure/auth/constants";
import { createUrlWithReturnUrl } from "@repo/infrastructure/auth/util";
import type { AnyElysia } from "elysia";

type FetchApiOptions = {
  /**
   * Function to navigate to a new url client side.
   */
  navigate?: (url: string) => void;
};

export function getFetchApi<T extends AnyElysia>({ navigate }: FetchApiOptions = {}) {
  return edenFetch<T>(getApiUrl(), {
    fetcher: async (url, options) => {
      const res = await fetch(url, supportMultipartFormData(options));

      if (res.status === 302) {
        const clientLocation = res.headers.get("Client-Location");
        const redirectUrl = clientLocation ?? createUrlWithReturnUrl(signInPath);

        if (redirectUrl.startsWith("/") && navigate) {
          navigate(redirectUrl);
        } else {
          window.location.href = redirectUrl;
        }

        return new Response(null, { status: 200 });
      }

      // Redirect to sign in if not authenticated
      if (res.status === 401) {
        window.location.href = createUrlWithReturnUrl(signInPath);
        return new Response(null, { status: 200 });
      }
      return res;
    }
  });
}

function getApiUrl() {
  const { hostname } = new URL(import.meta.runtime_env.PUBLIC_URL);

  if (window.location.hostname === hostname) {
    return import.meta.runtime_env.PUBLIC_URL;
  }

  const [tenantSubdomain] = window.location.hostname.split(".");

  if (window.location.hostname !== `${tenantSubdomain}.${hostname}`) {
    throw new Error("Tenant subdomain does not match hostname");
  }

  return `https://${tenantSubdomain}.${hostname}`;
}

function supportMultipartFormData(options?: RequestInit | FetchRequestInit) {
  if (!options) {
    return options;
  }

  const headers = new Headers(options.headers ?? {});
  if (
    (options.method === "POST" && headers.get("Content-Type")?.includes("multipart/form-data")) ||
    headers.get("content-type")?.includes("multipart/form-data")
  ) {
    // Ref: https://github.com/elysiajs/eden/issues/32
    headers.delete("Content-Type");
    headers.delete("content-type");
    options.headers = headers;
  }

  return options;
}
