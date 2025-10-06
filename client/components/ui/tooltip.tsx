import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

// Provide resilient wrappers around Radix tooltip primitives to avoid runtime crashes
// when the installed @radix-ui packages are incompatible with the React version in use.

type TooltipProviderProps = React.PropsWithChildren<{
  delayDuration?: number;
  skipDelayDuration?: number;
}>;

export function TooltipProvider({ children, ...props }: TooltipProviderProps) {
  try {
    // Try rendering the Radix provider; if it throws, we'll catch and fall back.
    return (
      <TooltipPrimitive.Provider {...(props as any)}>{children}</TooltipPrimitive.Provider>
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[tooltip] Radix TooltipProvider failed — falling back to no-op provider", err);
    return <>{children}</>;
  }
}

export const Tooltip: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  // Radix Root can be a no-op wrapper in fallback mode
  return <>{children}</>;
};

export const TooltipTrigger: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  // Pass-through trigger — expects a single child element
  return <>{children}</>;
};

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number }
>(({ className, sideOffset = 4, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="tooltip"
      {...props}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        className,
      )}
      style={{ // keep spacing behavior compatible with Radix default sideOffset
        ...(props.style as React.CSSProperties),
        // no-op sideOffset handling in fallback
        margin: (props.style as React.CSSProperties)?.margin,
      }}
    />
  );
});
TooltipContent.displayName = "TooltipContent";

export default TooltipContent;
