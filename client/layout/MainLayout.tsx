import { Fragment, type ComponentType, type SVGProps, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  BarChart4,
  Users2,
  Settings2,
  LogOut,
  BellRing,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  roles: Array<"owner" | "cashier">;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", path: "/", icon: LayoutDashboard, roles: ["owner"] },
  { label: "POS", path: "/pos", icon: ShoppingBag, roles: ["owner", "cashier"], badge: "Live" },
  { label: "Inventory", path: "/inventory", icon: Boxes, roles: ["owner"] },
  { label: "Reports", path: "/reports", icon: BarChart4, roles: ["owner"] },
  { label: "Users", path: "/users", icon: Users2, roles: ["owner"] },
  { label: "Settings", path: "/settings", icon: Settings2, roles: ["owner"] },
];

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, role, profile, requiresPasswordChange } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = useMemo(() => NAV_ITEMS.filter((item) => (role ? item.roles.includes(role) : false)), [role]);

  useEffect(() => {
    if (role === "cashier" && location.pathname === "/") {
      navigate("/pos", { replace: true });
    }
  }, [role, location.pathname, navigate]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-marco-luxe">
      <div className="mx-auto flex min-h-screen max-w-6xl gap-6 px-4 pb-10 pt-6 md:px-6 lg:gap-10">
        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-card shadow-brand-soft lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen ? (
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.aside
                className="absolute left-0 top-0 h-full w-[78%] max-w-xs bg-card p-6 shadow-2xl"
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
              >
                <button
                  type="button"
                  className="mb-8 flex h-10 w-10 items-center justify-center rounded-full border border-border"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
                <SidebarContent
                  items={items}
                  locationPathname={location.pathname}
                  onNavigate={handleNavigate}
                  onSignOut={signOut}
                  profileName={profile?.displayName ?? profile?.email ?? ""}
                />
              </motion.aside>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-8 space-y-8">
            <div className="glass-panel p-6 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">Marco POS</p>
              <h1 className="mt-2 text-xl font-display text-gradient-gold">Aesthetics Control</h1>
              <p className="mt-4 text-xs text-muted-foreground">
                Empowered by owner {profile?.displayName ?? "Connie"}
              </p>
            </div>
            <SidebarContent
              items={items}
              locationPathname={location.pathname}
              onNavigate={handleNavigate}
              onSignOut={signOut}
              profileName={profile?.displayName ?? profile?.email ?? ""}
            />
          </div>
        </aside>

        <main className="flex-grow space-y-6 pb-8">
          <header className="glass-panel flex flex-col gap-4 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-foreground/50">Today&apos;s Pulse</p>
              <h2 className="text-2xl font-display text-foreground/90">{getHeaderTitle(location.pathname)}</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn-secondary hidden sm:inline-flex"
                onClick={() => navigate("/pos")}
              >
                <ShoppingBag className="h-4 w-4" /> Open POS
              </button>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card"
                aria-label="Alerts"
              >
                <BellRing className="h-5 w-5 text-foreground" />
              </button>
              <div className="flex items-center gap-3 rounded-3xl bg-card/80 px-3 py-2 shadow-brand-soft">
                <div className="h-8 w-8 rounded-full bg-primary/15" />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-foreground/85">{profile?.displayName ?? "Owner"}</p>
                  <p className="text-xs text-muted-foreground">{role === "owner" ? "Owner" : "Cashier"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          {requiresPasswordChange ? (
            <div className="glass-panel border-primary/30 bg-primary/10 p-5 text-sm text-foreground/80 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Update required</p>
                  <p className="text-xs text-muted-foreground">
                    Please change the default owner password to continue protecting transaction data.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/auth/change-password")}
                className="btn-primary px-5 py-2 text-sm"
              >
                Change password now
              </button>
            </div>
          ) : null}

          <div className="glass-panel min-h-[62vh] p-5 sm:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-4 z-30 mx-auto w-[92%] rounded-3xl bg-card/95 px-4 py-3 shadow-brand-soft lg:hidden">
        <div className="flex items-center justify-between">
          {items.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || (item.path === "/" && location.pathname === "/");
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigate(item.path)}
                className={cn(
                  "nav-pill px-3 py-2",
                  active ? "nav-pill-active" : "nav-pill-inactive",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

const SidebarContent = ({
  items,
  locationPathname,
  onNavigate,
  onSignOut,
  profileName,
}: {
  items: NavItem[];
  locationPathname: string;
  onNavigate: (path: string) => void;
  onSignOut: () => void;
  profileName: string;
}) => {
  return (
    <Fragment>
      <div className="glass-panel space-y-3 p-6">
        {items.map((item) => {
          const Icon = item.icon;
          const active = locationPathname === item.path || (item.path === "/" && locationPathname === "/");
          return (
            <button
              type="button"
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={cn("nav-pill w-full", active ? "nav-pill-active" : "nav-pill-inactive")}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="glass-panel space-y-3 p-6 text-sm">
        <p className="text-muted-foreground">Signed in as</p>
        <p className="font-medium text-foreground">{profileName}</p>
        <button
          type="button"
          onClick={() => onSignOut()}
          className="btn-secondary w-full justify-center"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </Fragment>
  );
};

const getHeaderTitle = (pathname: string) => {
  switch (pathname) {
    case "/":
      return "Owner Overview";
    case "/pos":
      return "Point of Sale";
    case "/inventory":
      return "Inventory Intelligence";
    case "/reports":
      return "Performance Analytics";
    case "/users":
      return "Team & Access";
    case "/settings":
      return "App Settings";
    default:
      return "Marco POS";
  }
};

export default MainLayout;
