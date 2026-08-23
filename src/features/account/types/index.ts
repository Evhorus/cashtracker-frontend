// Provider-agnostic account types. Nothing in this file (or in
// features/account/components/) should ever import an auth SDK directly -
// that's confined to features/account/hooks/, same rule as features/auth/
// (see src/features/auth/types/index.ts).

export interface AccountUser {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  imageUrl: string;
  initials: string;
}

export interface ProfileFieldErrors {
  firstName?: string;
  lastName?: string;
}

export interface PasswordFieldErrors {
  currentPassword?: string;
  newPassword?: string;
}

export interface AccountActionResult {
  error: string | null;
}
