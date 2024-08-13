import { t, type Static } from "elysia";

const ProblemDetailErrorsSchema = t.Record(t.String(), t.Array(t.String()));
export type ProblemDetailErrors = Static<typeof ProblemDetailErrorsSchema>;

export const ProblemDetailsSchema = t.Object({
  /**
   * The type of problem
   */
  title: t.Optional(t.String()), // Short description of the problem
  type: t.Optional(t.String()), // "about:blank"
  status: t.Optional(t.Number()), // Actual HTTP status code
  detail: t.Optional(t.String()), // Guidance for the client to resolve the problem
  instance: t.Optional(t.String()), // URI to the specific instance of the problem
  errors: t.Optional(ProblemDetailErrorsSchema) // Additional details about specific fields that caused the problem
}); // We don't apply "strict" as the spec allows for additional properties

export type ProblemDetails = Static<typeof ProblemDetailsSchema>;

export class ProblemDetailsError extends Error {
  constructor(
    public readonly details: ProblemDetails,
    public readonly status: number = 400
  ) {
    super(details.title);
  }
}
