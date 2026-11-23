import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

// Maps thrown Clerk UserResource promise errors to field/global errors; keeps Clerk error parsing inside hooks/.
// `fieldParamNames` maps UI fields to snake_case/camelCase backend `param_name`s; `fallbackMessage` is caller-localized.
export function mapClerkError<TField extends string>(
  err: unknown,
  fieldParamNames: Record<TField, readonly string[]>,
  fallbackMessage: string,
): { fieldErrors: Partial<Record<TField, string>>; globalErrors: string[] } {
  const fieldErrors: Partial<Record<TField, string>> = {};
  const globalErrors: string[] = [];

  if (!isClerkAPIResponseError(err)) {
    globalErrors.push(fallbackMessage);
    return { fieldErrors, globalErrors };
  }

  const fields = Object.keys(fieldParamNames) as TField[];

  for (const apiError of err.errors) {
    const message = apiError.longMessage ?? apiError.message;
    const paramName = apiError.meta?.paramName;
    const field = paramName
      ? fields.find((f) => fieldParamNames[f].includes(paramName))
      : undefined;

    if (field) {
      fieldErrors[field] = message;
    } else {
      globalErrors.push(message);
    }
  }

  return { fieldErrors, globalErrors };
}
