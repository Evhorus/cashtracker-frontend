"use client";

import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  profileFormSchema,
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
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    const { error } = await updateProfile(values);
    if (!error) toast.success("Perfil actualizado");
  }

  async function onPhotoSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    event.target.value = "";
    if (!file) return;

    const { error } = await updatePhoto(file);
    if (!error) toast.success("Foto de perfil actualizada");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Tu nombre y foto de perfil</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-y-4">
        {globalErrors.map((message, i) => (
          <ErrorMessage key={i}>{message}</ErrorMessage>
        ))}
        {photoError && <ErrorMessage>{photoError}</ErrorMessage>}

        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarImage src={user.imageUrl} alt={user.fullName} />
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPhotoSelected}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUpdatingPhoto}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUpdatingPhoto ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Camera />
              )}
              Cambiar foto
            </Button>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-y-4">
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-0">
            <FormInput
              control={form.control}
              name="firstName"
              label="Nombre"
              autoComplete="given-name"
              disabled={isUpdatingProfile}
              serverError={fieldErrors.firstName}
            />
            <FormInput
              control={form.control}
              name="lastName"
              label="Apellido"
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
