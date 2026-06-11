"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { signOutAction } from "@/lib/auth/actions";
import { Button, type ButtonProps } from "@/components/ui/button";

type SignOutButtonProps = Omit<ButtonProps, "onClick" | "type">;

export function SignOutButton({ children, ...props }: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={isPending}
      onClick={() => startTransition(() => signOutAction())}
      {...props}
    >
      <LogOut className="size-[18px] shrink-0" />
      {children ?? (isPending ? "Signing out..." : "Logout")}
    </Button>
  );
}
