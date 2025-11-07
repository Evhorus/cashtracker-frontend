'use client';
import { Loader2, Menu, User2, Wallet } from 'lucide-react';
import { Button } from './ui/button';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/nextjs';
import { Logo } from './Logo';
import { ModeToggle } from './mode-toggle';

export const CustomHeader = () => {
  const { isLoaded, user } = useUser();
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50 ">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Logo />

        <div className="flex items-center gap-2">
          <ModeToggle />
          {!isLoaded ? (
            <Loader2 className="animate-spin" />
          ) : !user ? (
            <SignedOut>
              <SignInButton>
                <Button
                  size="default"
                  variant="outline"
                  aria-label="Iniciar sesión"
                >
                  Iniciar sesión
                </Button>
              </SignInButton>
            </SignedOut>
          ) : (
            <SignedIn>
              <UserButton />
            </SignedIn>
          )}
        </div>
      </div>
    </header>
  );
};
