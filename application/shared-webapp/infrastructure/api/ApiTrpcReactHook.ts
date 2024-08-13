import { useCallback, useEffect, useRef, useState } from "react";
import { useMemorizedObject } from "@repo/utils/hooks/useMemorizedObject";
import { type ProblemDetails, ProblemDetailsError } from "./ProblemDetails";

type UseApiReturnType<Data> = {
  loading: boolean;
  success: boolean | null;
  data?: Data;
  error?: ProblemDetails;
  refresh: () => void;
};

export type ApiReactHookOptions = {
  /**
   * Setting cache to "true" will enable caching of the request but disable the abort controller for the request.
   *
   * @default false
   */
  cache?: boolean;
  /**
   * Setting autoFetch to "true" will automatically fetch the data when the component mounts.
   * This is useful for components that need to fetch data immediately and for loading data that requires more
   * data to be fetched.
   *
   * @default true
   */
  autoFetch?: boolean;
  /**
   * Debounce the request by the specified number of milliseconds.
   * This is useful for components that need to fetch data immediately and for "search" components that require
   * a delay before fetching data.
   *
   * @default undefined
   */
  debounceMs?: number;
};

// biome-ignore lint/suspicious/noExplicitAny: This is a generic function
type Mutation = { mutate: (...args: any) => Promise<unknown> };
// biome-ignore lint/suspicious/noExplicitAny: This is a generic function
type Query = { query: (...args: any) => Promise<unknown> };
type TrpcClient = Record<string, Mutation | Query>;

type TrpcQuery<T extends TrpcClient> = {
  [K in keyof T as T[K] extends Query ? K : never]: T[K] extends Query ? T[K] : never;
};

export function createApiTrpcReactHook<T extends TrpcClient>(client: T) {
  return <
    P extends keyof TrpcQuery<T>,
    A extends TrpcQuery<T>[P],
    Options = Parameters<A["query"]>[0],
    Data = Awaited<ReturnType<A["query"]>>
  >(
    name: P,
    options: Options,
    hookOptions: ApiReactHookOptions = {}
  ): UseApiReturnType<Data> => {
    const procedure = client[name];

    if (isMutation(procedure)) {
      throw new Error(`The method "${name.toString()}" does not exist on the client.`);
    }
    const [problemDetails, setProblemDetails] = useState<ProblemDetails | undefined>();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<boolean | null>(null);
    const [data, setData] = useState<Data | undefined>();
    const fetchDataRef = useRef<((cacheMode?: "reload" | "default") => void) | undefined>();

    // Use a memorized object to prevent unnecessary re-renders
    const memorizedOptions = useMemorizedObject(options);
    const memorizedHookOptions = useMemorizedObject({
      autoFetch: true,
      cache: false,
      debounceMs: undefined,
      ...hookOptions
    });

    const refresh = useCallback(() => {
      if (fetchDataRef.current) fetchDataRef.current("reload");
    }, []);

    const apiMethod = procedure.query;

    useEffect(() => {
      let requestPending = false;
      const abortController = new AbortController();

      const fetchData = async (cacheMode: "reload" | "default" = "default") => {
        if (abortController.signal.aborted || requestPending) return;
        requestPending = true;
        setSuccess(null);
        setLoading(true);
        try {
          const data = await apiMethod(memorizedOptions, {
            // Use the cache option to determine the cache mode
            cache: cacheMode,
            // Disable the abort controller if caching is enabled
            signal: memorizedHookOptions.cache === true ? undefined : abortController.signal
          });
          if (!abortController.signal.aborted) {
            setData(data as Data);
            setSuccess(true);
          }
        } catch (error) {
          if (!abortController.signal.aborted) setSuccess(false);
          if (error instanceof ProblemDetailsError) {
            // The api client always throws ProblemDetailsError
            if (!abortController.signal.aborted) setProblemDetails(error.details);
          } else {
            // Unexpected error in the client
            throw error;
          }
        } finally {
          if (!abortController.signal.aborted) {
            requestPending = false;
            setLoading(false);
            fetchDataRef.current = fetchData;
          }
        }
      };

      let timeout: Timer | undefined;

      if (memorizedHookOptions.autoFetch) {
        if (memorizedHookOptions.debounceMs) {
          timeout = setTimeout(() => fetchData(), memorizedHookOptions.debounceMs);
        } else {
          fetchData();
        }
      } else {
        setLoading(false);
        setSuccess(null);
        setData(undefined);
        fetchDataRef.current = fetchData;
      }

      return () => {
        if (timeout) clearTimeout(timeout);
        fetchDataRef.current = undefined;
        abortController.abort();
      };
    }, [apiMethod, memorizedHookOptions, memorizedOptions]);

    return {
      loading,
      success,
      error: problemDetails,
      data,
      refresh
    };
  };
}

function isMutation(method: Mutation | Query): method is Mutation {
  return "mutate" in method;
}

function isQuery(method: Mutation | Query): method is Query {
  return "query" in method;
}
