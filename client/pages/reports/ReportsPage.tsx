import { useMemo, type ReactNode } from "react";
import { Download, CalendarRange, PieChart, BarChart3, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const dailySummary = {
  date: "Jan 18, 2025",
  sales: 1320,
  transactions: 71,
  avgBasket: 18.6,
  bestLocation: "Vision City",
  busiestHour: "4pm",
};

const monthlyPerformance = [
  { month: "Aug", revenue: 8800, profit: 0.46 },
  { month: "Sep", revenue: 9120, profit: 0.47 },
  { month: "Oct", revenue: 10520, profit: 0.5 },
  { month: "Nov", revenue: 11460, profit: 0.52 },
  { month: "Dec", revenue: 13240, profit: 0.54 },
];

const ReportsPage = () => {
  const totalMonthlyRevenue = useMemo(
    () => monthlyPerformance.reduce((sum, entry) => sum + entry.revenue, 0),
    [],
  );

  return (
    <div className="space-y-8">
      <section className="glass-panel flex flex-col gap-4 rounded-3xl bg-card/90 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-display text-foreground">Insights & reporting</h2>
          <p className="text-sm text-muted-foreground">
            Track sales velocity, bundle performance, and send automated WhatsApp summaries to the owner nightly.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button className="btn-secondary" type="button">
            <CalendarRange className="mr-2 h-4 w-4" /> Pick range
          </Button>
          <Button className="btn-primary" type="button">
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <MetricCard
          title="Today&apos;s sales"
          value={`K${dailySummary.sales}`}
          description={`${dailySummary.transactions} transactions • Avg basket K${dailySummary.avgBasket}`}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <MetricCard
          title="Weekly revenue"
          value={`K${totalMonthlyRevenue.toLocaleString()}`}
          description="Combined across pop-up markets and social channels"
          icon={<PieChart className="h-5 w-5" />}
        />
        <MetricCard
          title="Busiest window"
          value={dailySummary.busiestHour}
          description={`Best location: ${dailySummary.bestLocation}`}
          icon={<Clock className="h-5 w-5" />}
        />
      </section>

      <section className="surface-muted space-y-4 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-display">Monthly movement</h3>
            <p className="text-sm text-muted-foreground">Revenue and profit margin trends across the last five months.</p>
          </div>
          <Button type="button" className="btn-secondary">
            Share to WhatsApp
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {monthlyPerformance.map((entry) => (
            <div key={entry.month} className="glass-panel flex flex-col gap-2 rounded-2xl p-4 text-sm">
              <p className="text-muted-foreground">{entry.month}</p>
              <p className="text-lg font-semibold text-foreground">K{entry.revenue.toLocaleString()}</p>
              <span className="text-xs text-primary">Margin {Math.round(entry.profit * 100)}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="surface-muted border-0">
          <CardHeader>
            <CardTitle>Daily WhatsApp summary</CardTitle>
            <CardDescription>Delivered nightly at 9:30pm to owner and finance lead.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
              <p className="text-sm font-semibold text-foreground">Highlights included</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Total sales and cash on hand</li>
                <li>Busiest hour and best selling bundle</li>
                <li>Low stock snapshot with reorder suggestions</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
              <p className="text-sm font-semibold text-foreground">Escalations</p>
              <p>Flag variances over K50 or system issues to Connie via WhatsApp voice note.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-muted border-0">
          <CardHeader>
            <CardTitle>Monthly PDF pack</CardTitle>
            <CardDescription>Emailed on the first day of each month with deep dives.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
              <p className="text-sm font-semibold text-foreground">Inclusions</p>
              <p>Revenue by location, loyalty redemption, bundle performance, and POS device uptime.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
              <p className="text-sm font-semibold text-foreground">Recipients</p>
              <p>Owner, accountant, and manufacturing partner for demand planning.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/90 p-4">
              <p className="text-sm font-semibold text-foreground">Backup compliance</p>
              <p>Weekly Firestore export scheduled every Sunday with off-site email archive.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

const MetricCard = ({ title, value, description, icon }: { title: string; value: string; description: string; icon: ReactNode }) => {
  return (
    <Card className="glass-panel border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className="rounded-full bg-primary/15 p-2 text-primary">{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-display text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default ReportsPage;
