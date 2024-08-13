import type { FormProps } from "react-aria-components";
import { ProblemDetailsError } from "./ProblemDetails";

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

// biome-ignore lint/suspicious/noExplicitAny: This is a generic function
type Mutation = { mutate: (...args: any) => Promise<unknown> };
// biome-ignore lint/suspicious/noExplicitAny: This is a generic function
type Query = { query: (...args: any) => Promise<unknown> };
type TrpcClient = Record<string, Mutation | Query>;

type ActionTrpc<T extends TrpcClient> = {
  [K in keyof T as T[K] extends Mutation ? K : never]: T[K] extends Mutation ? T[K] : never;
};

export function createApiTrpcServerAction<T extends TrpcClient>(client: T) {
  return <P extends keyof ActionTrpc<T>, A extends ActionTrpc<T>[P], Data = Awaited<ReturnType<A["mutate"]>>>(
    name: P
  ) => {
    const procedure = client[name];
    if (isQuery(procedure)) {
      throw new Error(`The method "${name.toString()}" does not exist on the client.`);
    }
    return async (_: ActionClientState, formData: FormData): Promise<ActionClientState<Data>> => {
      try {
        const body = Object.fromEntries(formData);
        const data = (await procedure.mutate(body)) as Data;

        return {
          success: true,
          data,
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
  };
}

function isMutation(method: Mutation | Query): method is Mutation {
  return "mutate" in method;
}

function isQuery(method: Mutation | Query): method is Query {
  return "query" in method;
}
