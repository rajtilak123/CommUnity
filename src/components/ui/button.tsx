import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-label-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-current",
  {
    variants: {
      variant: {
        default:
          "bg-[#111111] text-[#F9F9F7] border border-[#111111] hover:bg-[#F9F9F7] hover:text-[#111111] dark:bg-[#F0EEE8] dark:text-[#0E0E0C] dark:border-[#F0EEE8] dark:hover:bg-[#0E0E0C] dark:hover:text-[#F0EEE8]",
        secondary:
          "bg-transparent border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7] dark:border-[#F0EEE8] dark:text-[#F0EEE8] dark:hover:bg-[#F0EEE8] dark:hover:text-[#0E0E0C]",
        ghost:
          "text-[#525252] hover:bg-[#E5E5E0] hover:text-[#111111] dark:text-[#A3A3A3] dark:hover:bg-[#222222] dark:hover:text-[#F0EEE8]",
        destructive:
          "bg-[#CC0000] text-white border border-[#CC0000] hover:bg-[#AA0000] hover:border-[#AA0000]",
        link: "text-[#111111] underline-offset-4 hover:underline dark:text-[#F0EEE8]",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 px-3 text-label-sm",
        lg: "h-12 px-6",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { buttonVariants };

