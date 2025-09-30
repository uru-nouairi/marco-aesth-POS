import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, LockKeyhole } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const DEFAULT_CREDENTIALS = {
  email: "owner@marcoaesthetics.png",
  password: "PWmarco123!",
};

const LoginPage = () => {
  const { signIn, initialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(DEFAULT_CREDENTIALS.email);
  const [password, setPassword] = useState(DEFAULT_CREDENTIALS.password);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      await signIn(email, password);
      const redirectPath = (location.state as { from?: Location })?.from?.pathname ?? "/";
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const message = err?.message ?? String(err) ?? "Unable to authenticate. Check your credentials and try again.";
      setError(message);
      console.error("Login failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-marco-luxe flex flex-col lg:flex-row">
      <section className="hidden lg:flex lg:w-1/2 xl:w-2/5 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass-panel w-full max-w-lg space-y-10 p-12"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F3fa5ac3e774e4464b3f469262124c7fc%2Fe7c0ed4cf42d462dbe4e26736ab649d7?format=webp&width=300"
                alt="Marco Aesthetics PNG logo"
                className="h-20 w-20 rounded-full border border-primary/30 shadow-brand-soft object-contain"
              />
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-foreground/60">
                  Marco Aesthetics
                </p>
                <h1 className="text-3xl font-display text-gradient-gold">POS Command Centre</h1>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Seamlessly manage sales, inventory, and loyalty from any pop-up stall. Secure, real-time,
              and crafted for on-the-go commerce in Papua New Guinea.
            </p>
          </div>

          <div className="grid gap-6">
            {["Offline-first sales capture", "Role-based access with owner oversight", "Automated WhatsApp summaries"].map((item) => (
              <div key={item} className="metric-tile flex-row items-center gap-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-foreground/80">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-panel w-full max-w-md p-8 sm:p-10"
        >
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ShieldCheck className="h-8 w-8" strokeWidth={2.4} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground">Sign in to continue</h2>
            <p className="text-sm text-muted-foreground">
              Use the credentials shared with you. Cashier accounts only access the POS checkout flow.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground/80">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-foreground shadow-brand-soft focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium text-foreground/80">
                <label htmlFor="password">Password</label>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <LockKeyhole className="h-3.5 w-3.5" /> Secure access
                </span>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-foreground shadow-brand-soft focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "btn-primary w-full justify-center py-3 text-base",
                isSubmitting && "opacity-80 cursor-not-allowed",
              )}
            >
              {isSubmitting ? "Signing in..." : "Access Dashboard"}
            </button>
          </form>

          <div className="mt-8 space-y-2 text-center text-xs text-muted-foreground">
            <p>Need a new cashier account? Ask the owner to invite you from the Users panel.</p>
            <p>
              Prefer a guided setup? <Link to="https://wa.me/67500000000" className="underline">Chat with Support on WhatsApp</Link>
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LoginPage;
