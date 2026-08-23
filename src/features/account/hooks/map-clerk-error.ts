import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

// Internal helper shared by every hook in this folder that calls a Clerk
// UserResource method directly (update, updatePassword, setProfileImage,
// delete - all plain promises that throw on failure, unlike the
// signIn/signUp "signals" resources features/auth/hooks/ reads from, which
// carry errors as data). Not exported outside features/account/hooks/ -
// this file exists to keep the isClerkAPIResponseError import (and the
// Clerk error shape it unpacks) out of every individual hook.
//
// `fieldParamNames` maps each UI field to the backend param_name(s) that
// should attach an error to it. Clerk's Backend API reports param_name in
// its own (largely snake_case, e.g. "first_name") naming, which doesn't
// necessarily match the camelCase keys the JS SDK methods accept - listing
// a couple of plausible spellings per field is cheap insurance against
// that mismatch. Anything that doesn't match a known field lands in
// globalErrors instead of silently disappearing.
export function mapClerkError<TField extends string>(
  err: unknown,
  fieldParamNames: Record<TField, readonly string[]>,
): { fieldErrors: Partial<Record<TField, string>>; globalErrors: string[] } {
  const fieldErrors: Partial<Record<TField, string>> = {};
  const globalErrors: string[] = [];

  if (!isClerkAPIResponseError(err)) {
    globalErrors.push("Ocurrió un error inesperado. Intenta de nuevo.");
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
