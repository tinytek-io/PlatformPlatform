import { z } from "zod";
import { ProblemDetailsError, ProblemDetailsSchema } from "./ProblemDetails";

type RequestResult<D, E> =
  | {
      data: D;
      error: null;
    }
  | {
      data: null;
      error: E;
    };

const errorResponseSchema = z.object({
  message: z.string().optional(),
  status: z.number()
});

const errorResponseWithDetailsSchema = z.object({
  message: z.string().optional(),
  status: z.number(),
  value: ProblemDetailsSchema
});

export function createFetchWithProblemDetails<Path extends string, Options extends {}, Data, Err>(
  client: (p: Path, o: Options) => Promise<RequestResult<Data, Err>>
) {
  return async (pathname: Path, options: Options): Promise<Data> => {
    try {
      const { data, error } = await client(pathname, options);
      if (error != null) {
        const errorParse = errorResponseWithDetailsSchema.safeParse(error);
        if (errorParse.success) {
          throw new ProblemDetailsError(errorParse.data.value);
        }

        const responseError = errorResponseSchema.parse(error);
        // Invalid problem details response
        throw new ProblemDetailsError({
          type: "fetch-error",
          status: responseError.status,
          title: "An error occurred",
          detail: responseError.message ?? "An unknown error occurred"
        });
      }

      return data as Data;
    } catch (error) {
      if (error instanceof ProblemDetailsError) {
        // Server validation errors
        if (import.meta.build_env.BUILD_TYPE === "development") console.warn("ProblemDetails", error.details);
        throw error;
      }
      if (error instanceof Error) {
        // Client error
        if (import.meta.build_env.BUILD_TYPE === "development") console.error("Error", error);
        throw new ProblemDetailsError({
          type: "tag:client-error",
          status: -1,
          title: "An error occurred",
          detail: error.message
        });
      }
      // Unknown error
      if (import.meta.build_env.BUILD_TYPE === "development") console.error("error", error);
      throw new ProblemDetailsError({
        type: "tag:unknown-error",
        status: -2,
        title: "An unknown error occurred",
        detail: `${error}`
      });
    }
  };
}
