import type { ErrorHandler, ValidationError } from "elysia";
import type { ProblemDetailErrors, ProblemDetails, ProblemDetailsError } from "./ProblemDetails";
import { logger } from "../../infrastructure/logger";
import { translatedValueError } from "./validationErrorTranslation";
import { defaultLocale, type Locale } from "../../infrastructure/i18n";

type ErrorHandlerContext = Parameters<ErrorHandler>[0];
type ProblemDetailsContext = Omit<ErrorHandlerContext, "code" | "error"> & {
  code: "ProblemDetailsError";
  error: ProblemDetailsError;
};

type ProblemDetailsHandlerContext = {
  locale?: Locale;
} & (ErrorHandlerContext | ProblemDetailsContext);

export function problemDetailsErrorHandler({
  code,
  error,
  set,
  locale = defaultLocale
}: ProblemDetailsHandlerContext): ProblemDetails {
  logger.error("ProblemDetailsError", { code, message: error.message });
  switch (code) {
    case "INTERNAL_SERVER_ERROR": {
      set.status = error.status;
      return {
        title: error.name,
        status: error.status,
        detail: error.message
      };
    }
    case "NOT_FOUND": {
      set.status = error.status;
      return {
        title: error.name,
        status: error.status,
        detail: error.message
      };
    }
    case "INVALID_COOKIE_SIGNATURE": {
      set.status = error.status;

      return {
        title: error.name,
        status: error.status,
        detail: error.message
      };
    }
    case "PARSE": {
      set.status = error.status;

      return {
        title: error.name,
        status: error.status,
        detail: error.message
      };
    }
    case "VALIDATION": {
      const problemDetails = problemDetailsFromValidationError(locale, error);
      set.status = problemDetails.status ?? 422;

      return problemDetails;
    }
    case "ProblemDetailsError": {
      set.status = error.status;
      return error.details;
    }
    default: {
      set.status = 400;
      return {
        title: "Unknown Error",
        status: 400,
        detail: "An unknown error occurred"
      };
    }
  }
}

function problemDetailsFromValidationError(locale: Locale, error: Readonly<ValidationError>): ProblemDetails {
  const errors: ProblemDetailErrors = {};

  for (const err of error.all) {
    const property = err.path.slice(1);
    if (errors[property] == null) errors[property] = [];
    errors[property].push(
      translatedValueError(locale, {
        errorType: err.type,
        path: err.path,
        schema: err.schema,
        value: err.value
      })
    );
  }

  const firstError = error.all[0];
  const detail = translatedValueError(locale, {
    errorType: firstError.type,
    path: firstError.path,
    schema: firstError.schema,
    value: firstError.value
  });

  return {
    title: error.name,
    status: error.status,
    detail,
    errors
  };
}

/**
 {
  "type": "validation",
  "on": "query",
  "summary": "Property 'subdomain' is missing",
  "property": "/subdomain",
  "message": "Required property",
  "expected": {
    "subdomain": "   "
  },
  "found": {},
  "errors": [
    {
      "type": 45,
      "schema": {
        "minLength": 3,
        "maxLength": 63,
        "type": "string"
      },
      "path": "/subdomain",
      "message": "Required property",
      "summary": "Property 'subdomain' is missing"
    },
    {
      "type": 54,
      "schema": {
        "minLength": 3,
        "maxLength": 63,
        "type": "string"
      },
      "path": "/subdomain",
      "message": "Expected string",
      "summary": "Expected  property 'subdomain' to be  string but found: undefined"
    }
  ]
}
 */
