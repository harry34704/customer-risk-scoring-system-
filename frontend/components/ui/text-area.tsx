import * as React from "react";

import { cn } from "@/lib/utils";

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "field-shell min-h-[120px] w-full rounded-2xl px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--signal)] focus:ring-2 focus:ring-[color:var(--signal-soft)]",
        className
      )}
      {...props}
    />
  )
);

TextArea.displayName = "TextArea";
