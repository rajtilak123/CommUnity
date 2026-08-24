"use client";

import { useActionState, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Copy, Check, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createResidentInvitationAction, type CreateInviteActionState } from "@/lib/residents/actions";

const initialState: CreateInviteActionState = {};

export function AddResidentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [state, formAction, isPending] = useActionState(createResidentInvitationAction, initialState);

  // Ensure portal target is ready after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleCopyCode = () => {
    if (state.code) {
      navigator.clipboard.writeText(state.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg min-w-[300px] sm:min-w-[480px] border border-outline-variant bg-surface p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-outline-variant pb-4">
          <div>
            <h2 className="font-serif text-headline-sm font-bold text-on-surface">
              {state.success ? "INVITATION CODE GENERATED" : "Add Resident"}
            </h2>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {state.success
                ? "Share this single-use code with the resident."
                : "Generate a secure 6-character invitation code for a new resident."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-on-surface-variant hover:text-on-surface p-1 transition-colors shrink-0 ml-2"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="rounded-none border border-accent bg-accent/10 px-4 py-2 font-mono text-xs text-accent">
            {state.error}
          </div>
        )}

        {/* Success State */}
        {state.success && state.code ? (
          <div className="space-y-4">
            {/* Invitation Code Banner */}
            <div className="space-y-2 text-center rounded-none border border-primary bg-surface p-6">
              <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                INVITATION CODE
              </span>
              <div className="font-mono text-3xl font-bold tracking-wider text-primary select-all">
                {state.code}
              </div>
              <p className="font-mono text-[11px] text-on-surface-variant">
                Expires in 7 days • This code can be used once to join your community.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={handleCopyCode}
                variant="default"
                className="w-full flex items-center justify-center gap-2"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                <span>{copied ? "COPIED!" : "COPY INVITATION CODE"}</span>
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Generate Code Form */
          <form action={formAction} className="space-y-6">
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Clicking generate will create a unique 6-character invitation code. Give this code to the resident so they can register and join your community.
            </p>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-outline-variant">
              <Button
                type="button"
                onClick={handleClose}
                variant="ghost"
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                variant="default"
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <UserPlus className="size-4" />
                <span>{isPending ? "Generating..." : "Generate Invitation Code"}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        variant="default"
        size="sm"
        className="flex items-center gap-1.5"
      >
        <Plus className="size-4" />
        <span>ADD RESIDENT</span>
      </Button>

      {mounted && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  );
}
