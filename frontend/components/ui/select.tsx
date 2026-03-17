import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "field-shell w-full rounded-2xl px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[color:var(--signal)] focus:ring-2 focus:ring-[color:var(--signal-soft)]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = "Select";
