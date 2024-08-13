import type { ErrorFunctionParameter } from "@sinclair/typebox/errors";
import { ValueErrorType } from "@sinclair/typebox/value";
import { Kind } from "@sinclair/typebox/type";
import { getI18n, type Locale } from "../../infrastructure/i18n";

export function translatedValueError(locale: Locale, error: ErrorFunctionParameter) {
  const i18n = getI18n(locale);
  switch (error.errorType) {
    case ValueErrorType.ArrayContains:
      return i18n.t("Expected array to contain at least one matching value");
    case ValueErrorType.ArrayMaxContains:
      return i18n.t("Expected array to contain no more than {maxContains} matching values", {
        maxContains: error.schema.maxContains
      });
    case ValueErrorType.ArrayMinContains:
      return i18n.t("Expected array to contain at least {minContains} matching values", {
        minContains: error.schema.minContains
      });
    case ValueErrorType.ArrayMaxItems:
      return i18n.t("Expected array length to be less or equal to {maxItems}", {
        maxItems: error.schema.maxItems
      });
    case ValueErrorType.ArrayMinItems:
      return i18n.t("Expected array length to be greater or equal to {minItems}", {
        minItems: error.schema.minItems
      });
    case ValueErrorType.ArrayUniqueItems:
      return i18n.t("Expected array elements to be unique");
    case ValueErrorType.Array:
      return i18n.t("Expected array");
    case ValueErrorType.AsyncIterator:
      return i18n.t("Expected AsyncIterator");
    case ValueErrorType.BigIntExclusiveMaximum:
      return i18n.t("Expected bigint to be less than {exclusiveMaximum}", {
        exclusiveMaximum: error.schema.exclusiveMaximum
      });
    case ValueErrorType.BigIntExclusiveMinimum:
      return i18n.t("Expected bigint to be greater than {exclusiveMinimum}", {
        exclusiveMinimum: error.schema.exclusiveMinimum
      });
    case ValueErrorType.BigIntMaximum:
      return i18n.t("Expected bigint to be less or equal to {maximum}", {
        maximum: error.schema.maximum
      });
    case ValueErrorType.BigIntMinimum:
      return i18n.t("Expected bigint to be greater or equal to {minimum}", {
        minimum: error.schema.minimum
      });
    case ValueErrorType.BigIntMultipleOf:
      return i18n.t("Expected bigint to be a multiple of {multipleOf}", {
        multipleOf: error.schema.multipleOf
      });
    case ValueErrorType.BigInt:
      return i18n.t("Expected bigint");
    case ValueErrorType.Boolean:
      return i18n.t("Expected boolean");
    case ValueErrorType.DateExclusiveMinimumTimestamp:
      return i18n.t("Expected Date timestamp to be greater than {exclusiveMinimumTimestamp}", {
        exclusiveMinimumTimestamp: error.schema.exclusiveMinimumTimestamp
      });
    case ValueErrorType.DateExclusiveMaximumTimestamp:
      return i18n.t("Expected Date timestamp to be less than {exclusiveMaximumTimestamp}", {
        exclusiveMaximumTimestamp: error.schema.exclusiveMaximumTimestamp
      });
    case ValueErrorType.DateMinimumTimestamp:
      return i18n.t("Expected Date timestamp to be greater or equal to {minimumTimestamp}", {
        minimumTimestamp: error.schema.minimumTimestamp
      });
    case ValueErrorType.DateMaximumTimestamp:
      return i18n.t("Expected Date timestamp to be less or equal to {maximumTimestamp}", {
        maximumTimestamp: error.schema.maximumTimestamp
      });
    case ValueErrorType.DateMultipleOfTimestamp:
      return i18n.t("Expected Date timestamp to be a multiple of {multipleOfTimestamp}", {
        multipleOfTimestamp: error.schema.multipleOfTimestamp
      });
    case ValueErrorType.Date:
      return i18n.t("Expected Date");
    case ValueErrorType.Function:
      return i18n.t("Expected function");
    case ValueErrorType.IntegerExclusiveMaximum:
      return i18n.t("Expected integer to be less than {exclusiveMaximum}", {
        exclusiveMaximum: error.schema.exclusiveMaximum
      });
    case ValueErrorType.IntegerExclusiveMinimum:
      return i18n.t("Expected integer to be greater than {exclusiveMinimum}", {
        exclusiveMinimum: error.schema.exclusiveMinimum
      });
    case ValueErrorType.IntegerMaximum:
      return i18n.t("Expected integer to be less or equal to {maximum}", {
        maximum: error.schema.maximum
      });
    case ValueErrorType.IntegerMinimum:
      return i18n.t("Expected integer to be greater or equal to {minimum}", {
        minimum: error.schema.minimum
      });
    case ValueErrorType.IntegerMultipleOf:
      return i18n.t("Expected integer to be a multiple of {multipleOf}", {
        multipleOf: error.schema.multipleOf
      });
    case ValueErrorType.Integer:
      return i18n.t("Expected integer");
    case ValueErrorType.IntersectUnevaluatedProperties:
      return i18n.t("Unexpected property");
    case ValueErrorType.Intersect:
      return i18n.t("Expected all values to match");
    case ValueErrorType.Iterator:
      return i18n.t("Expected Iterator");
    case ValueErrorType.Literal:
      return i18n.t("Expected {const}", {
        const: typeof error.schema.const === "string" ? `'${error.schema.const}'` : error.schema.const
      });
    case ValueErrorType.Never:
      return i18n.t("Never");
    case ValueErrorType.Not:
      return i18n.t("Value should not match");
    case ValueErrorType.Null:
      return i18n.t("Expected null");
    case ValueErrorType.NumberExclusiveMaximum:
      return i18n.t("Expected number to be less than {exclusiveMaximum}", {
        exclusiveMaximum: error.schema.exclusiveMaximum
      });
    case ValueErrorType.NumberExclusiveMinimum:
      return i18n.t("Expected number to be greater than {exclusiveMinimum}", {
        exclusiveMinimum: error.schema.exclusiveMinimum
      });
    case ValueErrorType.NumberMaximum:
      return i18n.t("Expected number to be less or equal to {maximum}", {
        maximum: error.schema.maximum
      });
    case ValueErrorType.NumberMinimum:
      return i18n.t("Expected number to be greater or equal to {minimum}", {
        minimum: error.schema.minimum
      });
    case ValueErrorType.NumberMultipleOf:
      return i18n.t("Expected number to be a multiple of {multipleOf}", {
        multipleOf: error.schema.multipleOf
      });
    case ValueErrorType.Number:
      return i18n.t("Expected number");
    case ValueErrorType.Object:
      return i18n.t("Expected object");
    case ValueErrorType.ObjectAdditionalProperties:
      return i18n.t("Unexpected property");
    case ValueErrorType.ObjectMaxProperties:
      return i18n.t("Expected object to have no more than {maxProperties} properties", {
        maxProperties: error.schema.maxProperties
      });
    case ValueErrorType.ObjectMinProperties:
      return i18n.t("Expected object to have at least {minProperties} properties", {
        minProperties: error.schema.minProperties
      });
    case ValueErrorType.ObjectRequiredProperty:
      return i18n.t("Expected required property");
    case ValueErrorType.Promise:
      return i18n.t("Expected Promise");
    case ValueErrorType.RegExp:
      return i18n.t("Expected string to match regular expression");
    case ValueErrorType.StringFormatUnknown:
      return i18n.t("Unknown format '{format}'", { format: error.schema.format });
    case ValueErrorType.StringFormat:
      return i18n.t("Expected string to match '{format}' format", { format: error.schema.format });
    case ValueErrorType.StringMaxLength:
      return i18n.t("Expected string length less or equal to {maxLength}", {
        maxLength: error.schema.maxLength
      });
    case ValueErrorType.StringMinLength:
      return i18n.t("Expected string length greater or equal to {minLength}", {
        minLength: error.schema.minLength
      });
    case ValueErrorType.StringPattern:
      return i18n.t("Expected string to match '{pattern}'", { pattern: error.schema.pattern });
    case ValueErrorType.String:
      return i18n.t("Expected string");
    case ValueErrorType.Symbol:
      return i18n.t("Expected symbol");
    case ValueErrorType.TupleLength:
      return i18n.t("Expected tuple to have {maxItems} elements", {
        maxItems: error.schema.maxItems ?? 0
      });
    case ValueErrorType.Tuple:
      return i18n.t("Expected tuple");
    case ValueErrorType.Uint8ArrayMaxByteLength:
      return i18n.t("Expected byte length less or equal to {maxByteLength}", {
        maxByteLength: error.schema.maxByteLength
      });
    case ValueErrorType.Uint8ArrayMinByteLength:
      return i18n.t("Expected byte length greater or equal to {minByteLength}", {
        minByteLength: error.schema.minByteLength
      });
    case ValueErrorType.Uint8Array:
      return i18n.t("Expected Uint8Array");
    case ValueErrorType.Undefined:
      return i18n.t("Expected undefined");
    case ValueErrorType.Union:
      return i18n.t("Expected union value");
    case ValueErrorType.Void:
      return i18n.t("Expected void");
    case ValueErrorType.Kind:
      return i18n.t("Expected kind '{kind}'", { kind: error.schema[Kind] ?? "unknown" });
    default:
      return i18n.t("Unknown error type");
  }
}
