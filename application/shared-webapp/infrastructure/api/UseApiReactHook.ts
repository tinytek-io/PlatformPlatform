import { useCallback, useEffect, useRef, useState } from "react";
import { useMemorizedObject } from "@repo/utils/hooks/useMemorizedObject";
import { type ProblemDetails, ProblemDetailsError } from "./ProblemDetails";
import { createFetchWithProblemDetails } from "./FetchWithProblemDetails";

type UseApiReturnType<Data> = {
  loading: boolean;
  success: boolean | null;
  refresh: () => void;
  data: Data;
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

type RequestResult<D, E> =
  | {
      data: D;
      error: null;
    }
  | {
      data: null;
      error: E;
    };

export function createUseApi<Path extends string, Options extends {}, Data, Err>(
  client: (p: Path, o: Options) => Promise<RequestResult<Data, Err>>
) {
  const clientWithProblemDetails = createFetchWithProblemDetails(client);

  return (pathname: Path, options: Options, hookOptions: ApiReactHookOptions = {}): UseApiReturnType<Data> => {
    const [problemDetails, setProblemDetails] = useState<ProblemDetails | undefined>();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<boolean | null>(null);
    const [data, setData] = useState<Data | undefined>();
    const fetchDataRef = useRef<((cacheMode?: "reload" | "default") => void) | undefined>();

    // Use a memorized object to prevent unnecessary re-renders
    const memorizedOptions = useMemorizedObject(stripUndefinedValues(options));
    const memorizedHookOptions = useMemorizedObject({
      autoFetch: true,
      cache: false,
      debounceMs: undefined,
      ...hookOptions
    });

    const refresh = useCallback(() => {
      if (fetchDataRef.current) fetchDataRef.current("reload");
    }, []);

    useEffect(() => {
      let requestPending = false;
      const abortController = new AbortController();

      const fetchData = async (cacheMode: "reload" | "default" = "default") => {
        if (abortController.signal.aborted || requestPending) return;
        requestPending = true;
        setSuccess(null);
        setLoading(true);
        try {
          console.log(pathname, memorizedOptions);

          const data = await clientWithProblemDetails(pathname, {
            ...memorizedOptions,
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
    }, [pathname, memorizedHookOptions, memorizedOptions]);

    return {
      loading,
      success,
      refresh,
      data: data as Data
    };
  };
}

function stripUndefinedValues<O extends {}>(o: O): O {
  return Object.fromEntries(
    Object.entries(o)
      .map(([key, value]) => [key, typeof value === "object" && value != null ? stripUndefinedValues(value) : value])
      .filter(([, v]) => v !== undefined)
  ) as O;
}
