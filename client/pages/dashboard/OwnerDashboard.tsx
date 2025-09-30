import { useMemo, type ReactNode } from "react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, Tooltip, BarChart, Bar, YAxis } from "recharts";
import { BadgeCheck, TrendingUp, Flame, MapPin, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const dailySales = [
  { day: "Mon", total: 540, transactions: 31 },
  { day: "Tue", total: 620, transactions: 36 },
  { day: "Wed", total: 710, transactions: 44 },
  { day: "Thu", total: 680, transactions: 40 },
  { day: "Fri", total: 830, transactions: 52 },
  { day: "Sat", total: 1240, transactions: 78 },
  { day: "Sun", total: 980, transactions: 61 },
];

const busiestHours = [
  { hour: "10am", tickets: 14 },
  { hour: "12pm", tickets: 28 },
  { hour: "2pm", tickets: 24 },
  { hour: "4pm", tickets: 31 },
  { hour: "6pm", tickets: 21 },
];

const topSkus = [
  { name: "Gold Wire Hoops", margin: 0.44, sold: 128 },
  { name: "Pearl Layered Necklace", margin: 0.52, sold: 94 },
  { name: "Rose Quartz Stack", margin: 0.49, sold: 87 },
];

const locationPerformance = [
  { location: "Ela Beach Market", revenue: 1440, growth: "+12%" },
  { location: "Vision City", revenue: 980, growth: "+8%" },
  { location: "Social Media", revenue: 760, growth: "+18%" },
];

const shiftSummary = [
  { cashier: "Marian", till: "POS-2", sales: "K820", closeTime: "9:35pm", variance: "Balanced" },
  { cashier: "Jesse", till: "POS-1", sales: "K645", closeTime: "8:50pm", variance: "Balanced" },
];

const OwnerDashboard = () => {
  const totalWeeklySales = useMemo(() => dailySales.reduce((sum, item) => sum + item.total, 0), []);
  const avgMargin = useMemo(() => Math.round(topSkus.reduce((sum, sku) => sum + sku.margin, 0) / topSkus.length * 100), []);
  const weeklyTransactions = useMemo(() => dailySales.reduce((sum, item) => sum + item.transactions, 0), []);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Weekly sales"
          value={`K${totalWeeklySales.toLocaleString()}`}
          footer="Up 18% vs last week"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          title="Transactions"
          value={weeklyTransactions.toString()}
          footer="Avg order value K18.40"
          icon={<BadgeCheck className="h-5 w-5" />}
        />
        <MetricCard
          title="Profit margin"
          value={`${avgMargin}%`}
          footer="Best performer: Pearl Layered Necklace"
          icon={<Wallet className="h-5 w-5" />}
        />
        <MetricCard
          title="Low stock alerts"
          value="4 SKUs"
          accent
          footer="Auto reorder triggered for 2 items"
          icon={<Flame className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="surface-muted p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-display">Daily sales velocity</h3>
              <p className="text-sm text-muted-foreground">Syncs instantly when devices come back online.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide">
              Offline-ready
            </span>
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySales}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#CBA45A" stopOpacity={0.7} />
                    <stop offset="90%" stopColor="#CBA45A" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EADBC5" />
                <XAxis dataKey="day" stroke="#7D603E" tickLine={false} axisLine={false} />
                <YAxis hide domain={[0, 1400]} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#E1CFAE", strokeWidth: 2 }} />
                <Area type="monotone" dataKey="total" stroke="#7D603E" strokeWidth={3} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="surface-muted space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-display">Busiest hours</h3>
              <p className="text-sm text-muted-foreground">Plan staffing and bundle promotions.</p>
            </div>
            <span className="rounded-full bg-accent/60 px-3 py-1 text-xs font-semibold text-accent-foreground">Live</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={busiestHours}>
                <defs>
                  <linearGradient id="barGradient" x1="0" x2="0" y1="1" y2="0">
                    <stop offset="10%" stopColor="#7D603E" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#CBA45A" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#EADBC5" />
                <XAxis dataKey="hour" stroke="#7D603E" tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip cursor={{ fill: "rgba(203,164,90,0.1)" }} />
                <Bar dataKey="tickets" fill="url(#barGradient)" radius={[12, 12, 12, 12]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface-muted space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display">Top performing SKUs</h3>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Weekly</span>
          </div>
          <div className="space-y-4">
            {topSkus.map((sku) => (
              <div key={sku.name} className="flex items-center justify-between gap-4 rounded-2xl border border-border/40 bg-card/90 p-4 shadow-brand-soft">
                <div>
                  <p className="text-sm font-semibold text-foreground">{sku.name}</p>
                  <p className="text-xs text-muted-foreground">{sku.sold} sold</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{Math.round(sku.margin * 100)}% margin</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-muted space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display">Market performance</h3>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Locations</span>
          </div>
          <div className="space-y-4">
            {locationPerformance.map((item) => (
              <div key={item.location} className="flex items-center justify-between gap-4 rounded-2xl border border-border/40 bg-card/90 p-4 shadow-brand-soft">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.location}</p>
                    <p className="text-xs text-muted-foreground">{item.growth} month-on-month</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">K{item.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-muted space-y-4 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-display">Shift closing summary</h3>
            <p className="text-sm text-muted-foreground">Ensure balanced tills and send WhatsApp receipts to the owner nightly.</p>
          </div>
          <button type="button" className="btn-primary">
            Export to WhatsApp
          </button>
        </div>
        <div className="grid gap-3">
          {shiftSummary.map((shift) => (
            <div key={shift.cashier} className="glass-panel flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{shift.cashier}</p>
                <p className="text-xs text-muted-foreground">Till {shift.till}</p>
              </div>
              <p className="text-sm font-semibold text-foreground">Sales {shift.sales}</p>
              <p className="text-xs text-muted-foreground">Closed {shift.closeTime}</p>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                {shift.variance}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const MetricCard = ({
  title,
  value,
  footer,
  icon,
  accent = false,
}: {
  title: string;
  value: string;
  footer: string;
  icon: ReactNode;
  accent?: boolean;
}) => {
  return (
    <div className={cn("metric-tile", accent && "border-primary/50 bg-primary/5")}> 
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
        <span className="rounded-full bg-primary/15 p-2 text-primary">{icon}</span>
      </div>
      <p className="text-3xl font-display text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{footer}</p>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-border bg-card/95 px-4 py-3 text-xs shadow-brand-soft">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-muted-foreground">Sales: K{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default OwnerDashboard;
