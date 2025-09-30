import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, AlertTriangle, RefreshCw, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  variant: string;
  cost: number;
  price: number;
  stock: number;
  reorderLevel: number;
  status: "ok" | "low" | "critical";
}

const seedInventory: InventoryItem[] = [
  {
    id: "1",
    sku: "SKU-001",
    name: "Gold Wire Hoops",
    variant: "Standard",
    cost: 2,
    price: 6,
    stock: 42,
    reorderLevel: 20,
    status: "ok",
  },
  {
    id: "2",
    sku: "SKU-002",
    name: "Pearl Layered Necklace",
    variant: "Double strand",
    cost: 4,
    price: 10,
    stock: 18,
    reorderLevel: 24,
    status: "low",
  },
  {
    id: "3",
    sku: "SKU-003",
    name: "Rose Quartz Stack",
    variant: "Set of 3",
    cost: 1.2,
    price: 5,
    stock: 12,
    reorderLevel: 18,
    status: "critical",
  },
  {
    id: "4",
    sku: "SKU-004",
    name: "Woven Band",
    variant: "Blush",
    cost: 0.8,
    price: 4,
    stock: 55,
    reorderLevel: 30,
    status: "ok",
  },
  {
    id: "5",
    sku: "SKU-005",
    name: "Velvet Scrunchie",
    variant: "Deep teal",
    cost: 0.7,
    price: 3,
    stock: 16,
    reorderLevel: 40,
    status: "low",
  },
];

const InventoryPage = () => {
  const [inventory] = useState(seedInventory);

  const lowStockItems = useMemo(
    () => inventory.filter((item) => item.status !== "ok"),
    [inventory],
  );

  return (
    <div className="space-y-8">
      <section className="glass-panel flex flex-col gap-4 rounded-3xl bg-card/90 p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-2xl font-display text-foreground">
            Stock oversight
          </h3>
          <p className="text-sm text-muted-foreground">
            Update SKUs, variants, pricing, and photos. Alerts trigger WhatsApp
            notifications when thresholds are reached.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button className="btn-secondary" type="button">
            <ImagePlus className="mr-2 h-4 w-4" /> Bulk upload photos
          </Button>
          <Button className="btn-primary" type="button">
            <PlusCircle className="mr-2 h-4 w-4" /> Add product
          </Button>
        </div>
      </section>

      <section className="surface-muted space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-display">Live catalogue</h4>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            {inventory.length} SKUs
          </Badge>
        </div>
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-white/80 shadow-brand-soft">
          <Table>
            <TableHeader className="bg-secondary/60">
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.variant}</TableCell>
                  <TableCell>K{item.cost.toFixed(2)}</TableCell>
                  <TableCell>K{item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={item.status}
                      remaining={item.stock - item.reorderLevel}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface-muted space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-display">Low stock signals</h4>
            <Badge className="rounded-full bg-destructive/10 text-destructive-foreground">
              {lowStockItems.length} items
            </Badge>
          </div>
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="glass-panel flex items-center justify-between rounded-2xl p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Current stock {item.stock} • Reorder at {item.reorderLevel}
                  </p>
                </div>
                <Button variant="secondary" size="sm" className="btn-secondary">
                  <RefreshCw className="mr-2 h-3.5 w-3.5" /> Trigger
                  auto-reorder
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-muted space-y-4 p-6">
          <h4 className="text-lg font-display">Notifications & automation</h4>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/70 bg-card/90 p-4">
              <p className="font-semibold text-foreground">WhatsApp alerts</p>
              <p>
                Send low stock push notifications to +675 7000 1000 when
                inventory dips below thresholds.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/90 p-4">
              <p className="font-semibold text-foreground">
                Auto reorder cadence
              </p>
              <p>
                Weekly on Mondays at 9 AM. Skip if stock coverage exceeds 3
                market days.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/90 p-4">
              <p className="font-semibold text-foreground">Supplier ledger</p>
              <p>
                Track costs with supplier tags for Bohoo PNG, Local Artisan
                Collective, and Amazon AU.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const StatusBadge = ({
  status,
  remaining,
}: {
  status: InventoryItem["status"];
  remaining: number;
}) => {
  switch (status) {
    case "ok":
      return (
        <Badge className="rounded-full bg-emerald-100 text-emerald-800">
          Healthy
        </Badge>
      );
    case "low":
      return (
        <Badge className="rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5" /> Low ({remaining})
        </Badge>
      );
    case "critical":
    default:
      return (
        <Badge className="rounded-full bg-red-100 text-red-700 flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5" /> Critical ({remaining})
        </Badge>
      );
  }
};

export default InventoryPage;
