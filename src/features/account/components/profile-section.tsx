"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorMessage } from "@/components/common/error-message";
import { FormInput } from "@/components/common/form-input";
import { SubmitButton } from "@/components/common/submit-button";
import { useUpdateProfile } from "../hooks/use-update-profile";
import {
  type ProfileFormValues,
  buildProfileFormSchema,
} from "../schemas/account.schema";
import type { AccountUser } from "../types";

interface ProfileSectionProps {
  user: AccountUser;
}

// `user` comes from the parent's useAccountUser() call (account-view.tsx)
// rather than this component calling the hook itself, so a photo/name
// update re-renders both this card and account-menu.tsx's trigger from
// the same Clerk-managed state, with no separate fetch to keep in sync.
export function ProfileSection({ user }: ProfileSectionProps) {
  const t = useTranslations("account.profile");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    isUpdatingProfile,
    isUpdatingPhoto,
    fieldErrors,
    globalErrors,
    photoError,
    updateProfile,
    updatePhoto,
  } = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(buildProfileFormSchema(tValidation)),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    const { error } = await updateProfile(values);
    if (!error) toast.success(t("savedToast"));
  }

  async function onPhotoSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    event.target.value = "";
    if (!file) return;

    const { error } = await updatePhoto(file);
    if (!error) toast.success(t("photoSavedToast"));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-y-4">
        {globalErrors.map((message, i) => (
          <ErrorMessage key={i}>{message}</ErrorMessage>
        ))}
        {photoError && <ErrorMessage>{photoError}</ErrorMessage>}

        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPhotoSelected}
          />
          {/* Camera-badge-overlay avatar (redesign): the whole avatar is
              the click target, badge just signals that - same
              onPhotoSelected/isUpdatingPhoto flow as the old separate
              change-photo button, not a new upload path. */}
          <button
            type="button"
            disabled={isUpdatingPhoto}
            onClick={() => fileInputRef.current?.click()}
            aria-label={t("changePhoto")}
            className="group relative shrink-0 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-70"
          >
            <Avatar size="lg">
              <AvatarImage src={user.imageUrl} alt={user.fullName} />
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
            <span className="absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground transition-transform group-hover:scale-110">
              {isUpdatingPhoto ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Camera className="h-3 w-3" />
              )}
            </span>
          </button>
          <div>
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">
              Haz clic en la foto para cambiarla
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-y-4">
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-0">
            <FormInput
              control={form.control}
              name="firstName"
              label={tCommon("name")}
              autoComplete="given-name"
              disabled={isUpdatingProfile}
              serverError={fieldErrors.firstName}
            />
            <FormInput
              control={form.control}
              name="lastName"
              label={tCommon("lastName")}
              autoComplete="family-name"
              disabled={isUpdatingProfile}
              serverError={fieldErrors.lastName}
            />
          </div>
          <SubmitButton
            type="submit"
            isLoading={isUpdatingProfile}
            className="w-fit"
          >
            Guardar cambios
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
