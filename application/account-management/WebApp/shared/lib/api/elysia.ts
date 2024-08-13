import type { ApiType } from "@/api-types";
import { createUseApi } from "@repo/infrastructure/api/UseApiReactHook";
import { createApiServerAction } from "@repo/infrastructure/api/ApiServerAction";
import { getFetchApi } from "@repo/infrastructure/api/getFetchApi";
import { router } from "../router/router";

export const fetchApi = getFetchApi<ApiType>({
  navigate: (url) => {
    router.navigate({ to: url });
  }
});

export const useApi = createUseApi(fetchApi);

export const serverAction = createApiServerAction(fetchApi);
