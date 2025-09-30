import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const ChangeOwnerPassword = () => {
  const navigate = useNavigate();
  const { changeOwnerPassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (newPassword !== confirmPassword) {
      setFeedback({
        tone: "error",
        message: "New password entries do not match.",
      });
      return;
    }

    if (newPassword.length < 10) {
      setFeedback({
        tone: "error",
        message: "Use at least 10 characters for enhanced security.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await changeOwnerPassword(currentPassword, newPassword);
      setFeedback({
        tone: "success",
        message: "Password updated successfully.",
      });
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Owner password change failed", error);
      setFeedback({
        tone: "error",
        message:
          "Unable to update password. Confirm your current password and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-marco-luxe flex flex-col items-center justify-center px-6 py-12">
      <div className="glass-panel w-full max-w-2xl p-8 sm:p-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mt-6 flex flex-col gap-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display text-foreground">
            Secure your owner account
          </h1>
          <p className="text-sm text-muted-foreground">
            Update the default password to protect transactions, inventory data,
            and cash drawer reports.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-foreground/80"
              htmlFor="current-password"
            >
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-foreground shadow-brand-soft focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground/80"
                htmlFor="new-password"
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-foreground shadow-brand-soft focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground/80"
                htmlFor="confirm-password"
              >
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-foreground shadow-brand-soft focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-secondary/50 bg-secondary/60 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground/70">Password tips</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Minimum 10 characters</li>
              <li>
                Use a mix of upper and lowercase letters, numbers, and symbols
              </li>
              <li>Rotate passwords each quarter and avoid reusing old ones</li>
            </ul>
          </div>

          {feedback ? (
            <div
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm",
                feedback.tone === "success"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900"
                  : "border-destructive/40 bg-destructive/10 text-destructive-foreground",
              )}
            >
              <div className="flex items-center gap-2">
                {feedback.tone === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : null}
                <span>{feedback.message}</span>
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3 text-base"
          >
            {isSubmitting ? "Updating password..." : "Save secure password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangeOwnerPassword;
