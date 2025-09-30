import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  title?: string;
  message?: string;
  className?: string;
}

export const LoadingScreen = ({
  title = "Preparing your workspace",
  message = "Syncing data securely...",
  className,
}: LoadingScreenProps) => {
  return (
    <section
      className={cn(
        "min-h-screen w-full bg-marco-luxe flex items-center justify-center px-6",
        className,
      )}
    >
      <div className="glass-panel max-w-md w-full text-center space-y-5 p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
          <Loader2
            className="h-8 w-8 animate-spin text-primary"
            strokeWidth={2.5}
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.4em] text-foreground/60">
            Marco Aesthetics POS
          </p>
          <h2 className="text-2xl font-display text-foreground/90">{title}</h2>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </section>
  );
};
