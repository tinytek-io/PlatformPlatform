import type { FormProps } from "react-aria-components";
import { ProblemDetailsError } from "./ProblemDetails";
import { createFetchWithProblemDetails } from "./FetchWithProblemDetails";

export type ValidationErrors = NonNullable<FormProps["validationErrors"]>;

export type ActionClientState<D = unknown> =
  | {
      success?: null;
      data?: null;
      // Problem details
      type?: string;
      status?: number;
      title?: string;
      message?: string;
      errors?: ValidationErrors;
    }
  | {
      success: false;
      data: undefined;
      // Problem details
      type?: string;
      status?: number;
      title?: string;
      message?: string;
      errors?: ValidationErrors;
    }
  | {
      success: true;
      data: D;
      // Problem details
      type: undefined;
      status: undefined;
      title: undefined;
      message: undefined;
      errors: undefined;
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

export function createApiServerAction<Path extends string, Options extends {}, Data, Err>(
  client: (p: Path, o: Options) => Promise<RequestResult<Data, Err>>
) {
  const clientWithProblemDetails = createFetchWithProblemDetails(client);
  return (templateUrl: Path) =>
    async (_: ActionClientState, formData: FormData): Promise<ActionClientState<Data>> => {
      try {
        const paramPaths: Record<string, string> = {};
        const pathParamNames = getParamNamesFromTemplateUrl(templateUrl.toString());

        for (const paramName of pathParamNames) {
          const value = formData.get(paramName);
          if (value == null) {
            throw new Error(`Missing path parameter: ${paramName}`);
          }
          if (typeof value !== "string") {
            throw new Error(`Invalid path parameter: ${paramName}, type: ${typeof value}`);
          }
          paramPaths[paramName] = value;
          formData.delete(paramName);
        }

        const data = await clientWithProblemDetails(templateUrl, {
          // Make body data available for path parameters
          params: paramPaths,
          body: formData,
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data"
          }
          // biome-ignore lint/suspicious/noExplicitAny: We don't know the type at this point
        } as any);

        return {
          success: true,
          data: data as Data,
          type: undefined,
          status: undefined,
          title: undefined,
          message: undefined,
          errors: undefined
        };
      } catch (error) {
        if (error instanceof ProblemDetailsError) {
          // The api client should always return a ProblemDetailsError
          return {
            success: false,
            data: undefined,
            type: error.details.type,
            status: error.details.status,
            title: error.details.title,
            message: error.details.detail,
            errors: error.details.errors
          };
        }
        if (error instanceof Error) {
          // Unknown error
          return {
            success: false,
            type: "",
            status: -1,
            title: error.name,
            message: error.message,
            data: undefined,
            errors: {}
          };
        }
        // Unknown error
        return {
          success: false,
          type: "",
          status: -2,
          title: "Unknown error",
          message: "An error occurred.",
          data: undefined,
          errors: {}
        };
      }
    };
}

function getParamNamesFromTemplateUrl(templateUrl: string): string[] {
  return templateUrl.match(/\/:([-a-zA-Z0-9]+)/g)?.map((match) => match.slice(2)) ?? [];
}
