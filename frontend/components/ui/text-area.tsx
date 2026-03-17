import * as React from "react";

import { cn } from "@/lib/utils";

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-signal focus:ring-2 focus:ring-teal-100",
        className
      )}
      {...props}
    />
  )
);

TextArea.displayName = "TextArea";

