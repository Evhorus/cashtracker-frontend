"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

import type { AccountActionResult, ProfileFieldErrors } from "../types";
import { mapClerkError } from "./map-clerk-error";

// Owns the "profile" section of the account page: name and photo. Only
// file (besides map-clerk-error.ts) in features/account/ that imports
// useUser() for writes - use-account-user.ts covers the read-only display
// case. See features/auth/hooks/use-sign-in.ts for the provider-agnostic
// reasoning this mirrors.
export function useUpdateProfile() {
  const { user } = useUser();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);

  async function updateProfile(values: {
    firstName: string;
    lastName: string;
  }): Promise<AccountActionResult> {
    if (!user) return { error: "No hay una sesión activa" };

    setIsUpdatingProfile(true);
    setFieldErrors({});
    setGlobalErrors([]);
    try {
      await user.update(values);
      return { error: null };
    } catch (err) {
      const { fieldErrors: fields, globalErrors: globals } = mapClerkError(
        err,
        {
          firstName: ["first_name", "firstName"],
          lastName: ["last_name", "lastName"],
        },
      );
      setFieldErrors(fields);
      setGlobalErrors(globals);
      return { error: globals[0] ?? "No se pudo actualizar el perfil" };
    } finally {
      setIsUpdatingProfile(false);
    }
  }

  async function updatePhoto(file: File): Promise<AccountActionResult> {
    if (!user) return { error: "No hay una sesión activa" };

    setIsUpdatingPhoto(true);
    setPhotoError(null);
    try {
      await user.setProfileImage({ file });
      return { error: null };
    } catch {
      // setProfileImage's own failures (bad format, too large) don't map
      // cleanly to a single param_name - a flat message covers it.
      const message = "No se pudo actualizar la foto de perfil";
      setPhotoError(message);
      return { error: message };
    } finally {
      setIsUpdatingPhoto(false);
    }
  }

  return {
    isUpdatingProfile,
    isUpdatingPhoto,
    fieldErrors,
    globalErrors,
    photoError,
    updateProfile,
    updatePhoto,
  };
}
