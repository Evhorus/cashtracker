"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

import type { AccountActionResult, ProfileFieldErrors } from "../types";
import { mapClerkError } from "./map-clerk-error";

// Write boundary for Clerk profile updates (name/photo); read-only display uses use-account-user.ts.
export function useUpdateProfile() {
  const t = useTranslations("account.errors");
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
    if (!user) return { error: t("noSession") };

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
        t("unexpected"),
      );
      setFieldErrors(fields);
      setGlobalErrors(globals);
      return { error: globals[0] ?? t("profileUpdateFailed") };
    } finally {
      setIsUpdatingProfile(false);
    }
  }

  async function updatePhoto(file: File): Promise<AccountActionResult> {
    if (!user) return { error: t("noSession") };

    setIsUpdatingPhoto(true);
    setPhotoError(null);
    try {
      await user.setProfileImage({ file });
      return { error: null };
    } catch {
      // setProfileImage's own failures (bad format, too large) don't map
      // cleanly to a single param_name - a flat message covers it.
      const message = t("photoUpdateFailed");
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
