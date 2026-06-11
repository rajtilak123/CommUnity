"use client";

import { Loader2, Send } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import { addComplaintCommentAction, type ComplaintActionState } from "@/lib/complaints/actions";
import type { ComplaintComment } from "@/types/complaints";
import type { Profile } from "@/types/auth";
import { cn } from "@/lib/utils";

const initialState: ComplaintActionState = {};

type CommentWithAuthor = ComplaintComment & {
  author: Pick<Profile, "id" | "full_name" | "role">;
};

type ComplaintCommentThreadProps = {
  complaintId: string;
  comments: CommentWithAuthor[];
  currentUserId: string;
  isAdmin?: boolean;
  className?: string;
};

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function ComplaintCommentThread({
  complaintId,
  comments,
  currentUserId,
  isAdmin = false,
  className,
}: ComplaintCommentThreadProps) {
  const [state, formAction, isPending] = useActionState(addComplaintCommentAction, initialState);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments.length, state.success]);

  return (
    <div
      className={cn(
        "flex h-[600px] flex-col rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-outline-variant p-md">
        <h3 className="text-headline-sm font-semibold text-on-surface">
          {isAdmin ? "Internal Discussion" : "Comments"}
        </h3>
        <span className="rounded bg-surface-container px-2 py-0.5 text-label-sm text-on-surface-variant">
          {comments.length} {comments.length === 1 ? "Message" : "Messages"}
        </span>
      </div>

      <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-md overflow-y-auto p-md">
        {comments.length === 0 ? (
          <p className="text-center text-body-md text-on-surface-variant">No comments yet.</p>
        ) : (
          comments.map((comment) => {
            const isOwn = comment.author_id === currentUserId;
            const authorLabel =
              comment.author.role === "admin"
                ? "Management"
                : isOwn
                  ? "You"
                  : comment.author.full_name ?? "Resident";

            return (
              <div
                key={comment.id}
                className={cn("flex max-w-[85%] flex-col", isOwn ? "ml-auto items-end" : "items-start")}
              >
                <div className={cn("mb-xs flex items-center gap-xs", isOwn && "flex-row-reverse")}>
                  <span
                    className={cn(
                      "text-label-sm font-bold",
                      comment.author.role === "admin" ? "text-primary" : "text-secondary",
                    )}
                  >
                    {authorLabel}
                  </span>
                  <span className="text-[10px] text-outline">{formatTime(comment.created_at)}</span>
                </div>
                <div
                  className={cn(
                    "p-md text-body-md",
                    isOwn
                      ? "rounded-tl-xl rounded-bl-xl rounded-br-xl bg-primary text-on-primary"
                      : "rounded-tr-xl rounded-br-xl rounded-bl-xl bg-surface-container-high text-on-surface",
                  )}
                >
                  {comment.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form action={formAction} className="border-t border-outline-variant p-md">
        <input type="hidden" name="complaintId" value={complaintId} />
        <input type="hidden" name="isInternal" value={isAdmin ? "true" : "false"} />
        <div className="relative">
          <textarea
            name="content"
            rows={2}
            placeholder="Type your message..."
            required
            className="w-full resize-none rounded-lg border border-outline-variant bg-surface p-md pr-12 text-body-md transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={isPending}
            className="absolute bottom-3 right-3 rounded-full p-1 text-primary transition-colors hover:bg-surface-container-high active:scale-90 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
          </button>
        </div>
        {state.error ? <p className="mt-sm text-body-md text-error">{state.error}</p> : null}
        {state.success ? <p className="mt-sm text-body-md text-primary">{state.success}</p> : null}
      </form>
    </div>
  );
}
