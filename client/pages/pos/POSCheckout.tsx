import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Minus,
  ShoppingCart,
  Tag,
  ArrowRight,
  Trash,
  WifiOff,
  Wifi,
  PercentCircle,
  Layers3,
  Printer,
  MessageCircle,
} from "lucide-react";
import { firebaseFirestore } from "@/services/firebase";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  bundle?: { quantity: number; price: number };
}

interface CartItem {
  product: Product;
  quantity: number;
  bundleApplied?: boolean;
}

const sampleProducts: Product[] = [
  {
    id: "SKU-001",
    name: "Gold Wire Hoops",
    price: 6,
    stock: 42,
    category: "Earrings",
    image:
      "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=400&q=80",
    bundle: { quantity: 3, price: 15 },
  },
  {
    id: "SKU-002",
    name: "Pearl Layered Necklace",
    price: 10,
    stock: 28,
    category: "Necklaces",
    image:
      "https://images.unsplash.com/photo-1600180758890-d2ed3f95bcede?auto=format&fit=crop&w=400&q=80",
    bundle: { quantity: 2, price: 18 },
  },
  {
    id: "SKU-003",
    name: "Rose Quartz Stack",
    price: 5,
    stock: 65,
    category: "Bracelets",
    image:
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "SKU-004",
    name: "Shell Anklet",
    price: 4,
    stock: 51,
    category: "Anklets",
    image:
      "https://images.unsplash.com/photo-1594633312681-425c1f234d80?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "SKU-005",
    name: "Velvet Scrunchie",
    price: 3,
    stock: 103,
    category: "Hair",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
    bundle: { quantity: 4, price: 10 },
  },
  {
    id: "SKU-006",
    name: "Kina Coin Charm",
    price: 7,
    stock: 37,
    category: "Charms",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "SKU-007",
    name: "Coconut Shell Earrings",
    price: 5,
    stock: 44,
    category: "Earrings",
    image:
      "https://images.unsplash.com/photo-1512499362904-43e7392aa7c4?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "SKU-008",
    name: "Woven Friendship Band",
    price: 4,
    stock: 89,
    category: "Bracelets",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "SKU-009",
    name: "Minimalist Ring Set",
    price: 6,
    stock: 56,
    category: "Rings",
    image:
      "https://images.unsplash.com/photo-1611599539395-0c07bda7e64c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "SKU-010",
    name: "Sunrise Hair Pins",
    price: 3,
    stock: 75,
    category: "Hair",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
  },
];

const POSCheckout = () => {
  const firestore = firebaseFirestore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [taxRate] = useState(0.1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [onlineStatus, setOnlineStatus] = useState(() => navigator.onLine);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSendingReceipt, setIsSendingReceipt] = useState(false);

  const cartTotals = useMemo(() => {
    let subtotal = 0;
    const cartItems = cart.map((item) => {
      let lineTotal = item.product.price * item.quantity;
      let bundleApplied = false;
      if (
        item.product.bundle &&
        item.quantity >= item.product.bundle.quantity
      ) {
        const { quantity, price } = item.product.bundle;
        const bundleCount = Math.floor(item.quantity / quantity);
        const remainder = item.quantity % quantity;
        lineTotal = bundleCount * price + remainder * item.product.price;
        bundleApplied = bundleCount > 0;
      }
      subtotal += lineTotal;
      return { ...item, lineTotal, bundleApplied };
    });

    const tax = subtotal * taxRate;
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal + tax - discountAmount;
    return { subtotal, tax, total, cartItems, discountAmount };
  }, [cart, taxRate, discount]);

  useEffect(() => {
    const storedQueue = localStorage.getItem("marco-pos-offline-queue");
    if (storedQueue) {
      setOfflineQueue(JSON.parse(storedQueue));
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (onlineStatus && offlineQueue.length > 0) {
      void syncOfflineTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlineStatus]);

  const updateQueueStorage = (queue: any[]) => {
    localStorage.setItem("marco-pos-offline-queue", JSON.stringify(queue));
    setOfflineQueue(queue);
  };

  const syncOfflineTransactions = async () => {
    setIsSyncing(true);
    const queue = [...offlineQueue];
    while (queue.length) {
      const entry = queue[0];
      try {
        if (!firestore) {
          console.warn("Firestore unavailable — cannot sync offline transactions");
          break;
        }
        await addDoc(collection(firestore, "transactions"), entry);
        queue.shift();
      } catch (error) {
        console.error("Failed to sync offline transaction", error);
        break;
      }
    }
    updateQueueStorage(queue);
    setIsSyncing(false);
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: Math.min(
                  Math.max(item.quantity + delta, 1),
                  item.product.stock,
                ),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemove = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const formatCurrency = (value: number) => `K${value.toFixed(2)}`;

  const chunkBuffer = (input: Uint8Array, size = 180) => {
    const chunks: Uint8Array[] = [];
    for (let index = 0; index < input.length; index += size) {
      chunks.push(input.slice(index, index + size));
    }
    return chunks;
  };

  const buildReceipt = () => {
    const generatedAt = new Date();
    const dateFormatter = new Intl.DateTimeFormat("en-PG", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const lines = [
      "Marco Aesthetics",
      "Ela Beach Market",
      "------------------------------",
      `Date: ${dateFormatter.format(generatedAt)}`,
      "Cashier: demo@marco-pos.app",
      `Status: ${navigator.onLine ? "Recorded" : "Pending sync (offline)"}`,
      "",
      "Items:",
    ];

    cartTotals.cartItems.forEach((item) => {
      const label = `${item.product.name} x${item.quantity}`;
      const paddedLabel = label.length >= 26 ? `${label.slice(0, 25)}…` : label.padEnd(26, " ");
      lines.push(`${paddedLabel}${formatCurrency(item.lineTotal)}`);
    });

    lines.push("------------------------------");
    lines.push(`Subtotal: ${formatCurrency(cartTotals.subtotal)}`);
    lines.push(`Tax (GST 10%): ${formatCurrency(cartTotals.tax)}`);
    if (cartTotals.discountAmount > 0) {
      lines.push(`Discount: -${formatCurrency(cartTotals.discountAmount)}`);
    }
    lines.push(`Total: ${formatCurrency(cartTotals.total)}`);
    lines.push("");
    lines.push("Payment method: Cash");
    lines.push("Location: Ela Beach Market");
    lines.push("");
    lines.push("Thank you for shopping with Marco Aesthetics!");

    return {
      generatedAt,
      lines,
      text: lines.join("\n"),
    };
  };

  const attemptBluetoothPrint = async (text: string) => {
    const bluetooth = navigator.bluetooth;
    if (!bluetooth || !window.isSecureContext) {
      return false;
    }

    const serviceUuid: BluetoothServiceUUID = 0xffe0;
    const characteristicUuid: BluetoothCharacteristicUUID = 0xffe1;
    let server: BluetoothRemoteGATTServer | null = null;

    try {
      const device = await bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [serviceUuid],
      });

      server = (await device.gatt?.connect()) ?? null;
      if (!server) {
        throw new Error("Could not connect to the Bluetooth printer.");
      }

      const service = await server.getPrimaryService(serviceUuid);
      const characteristic = await service.getCharacteristic(characteristicUuid);
      const encoder = new TextEncoder();
      const payload = encoder.encode(`${text}\n\n`);

      for (const chunk of chunkBuffer(payload)) {
        await characteristic.writeValue(chunk);
      }

      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotFoundError") {
        return false;
      }
      throw error;
    } finally {
      if (server?.connected) {
        server.disconnect();
      }
    }
  };

  const escapeHtml = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const openPrintPreview = (receipt: { lines: string[]; text: string }) => {
    const preview = window.open("", "print-receipt", "width=480,height=640");
    if (!preview) {
      throw new Error("Allow pop-ups to open the receipt preview.");
    }

    const content = receipt.lines.map((line) => escapeHtml(line)).join("<br />");

    preview.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Receipt</title>
    <style>
      body { font-family: 'Courier New', monospace; margin: 24px; }
      h1 { font-size: 1.1rem; margin-bottom: 12px; }
      pre { font-size: 0.9rem; }
    </style>
  </head>
  <body>
    <h1>Marco Aesthetics Receipt</h1>
    <pre>${content}</pre>
  </body>
</html>`);
    preview.document.close();
    preview.focus();
    setTimeout(() => {
      preview.print();
    }, 300);
  };

  const handlePrintReceipt = async () => {
    if (!cart.length) {
      toast({
        title: "Cart is empty",
        description: "Add items before printing a receipt.",
      });
      return;
    }

    setIsPrinting(true);
    const receipt = buildReceipt();

    try {
      if (navigator.bluetooth && window.isSecureContext) {
        try {
          const printed = await attemptBluetoothPrint(receipt.text);
          if (printed) {
            toast({
              title: "Receipt sent",
              description: "Bluetooth printer received the receipt.",
            });
            return;
          }
        } catch (error) {
          console.warn("[pos] Bluetooth printing failed", error);
          toast({
            title: "Bluetooth print failed",
            description:
              error instanceof Error
                ? error.message
                : "Unable to send data to the printer. Opening print preview instead.",
          });
        }
      }

      openPrintPreview(receipt);
      toast({
        title: "Print preview ready",
        description: "Use your browser's print dialog to finish printing.",
      });
    } catch (error) {
      console.error("[pos] Printing failed", error);
      toast({
        title: "Could not print",
        description:
          error instanceof Error
            ? error.message
            : "Printing is unavailable in this browser.",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleSendWhatsAppReceipt = () => {
    if (!cart.length) {
      toast({
        title: "Cart is empty",
        description: "Add items before sending a receipt.",
      });
      return;
    }

    setIsSendingReceipt(true);
    const receipt = buildReceipt();
    const message = [...receipt.lines, "", "Reply to this message if you need anything else."].join("\n");

    try {
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      const popup = window.open(url, "_blank", "noopener,noreferrer");
      if (!popup) {
        throw new Error("Allow pop-ups to share the receipt via WhatsApp.");
      }
      popup.focus();
      toast({
        title: "WhatsApp ready",
        description: "Review the message in WhatsApp before sending.",
      });
    } catch (error) {
      console.error("[pos] WhatsApp share failed", error);
      toast({
        title: "Could not open WhatsApp",
        description:
          error instanceof Error
            ? error.message
            : "WhatsApp sharing is unavailable on this device.",
      });
    } finally {
      setIsSendingReceipt(false);
    }
  };

  const submitTransaction = async () => {
    if (!cart.length) return;

    const payload = {
      items: cart.map((item) => ({
        sku: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal: cartTotals.subtotal,
      tax: cartTotals.tax,
      discountPercent: discount,
      discountAmount: cartTotals.discountAmount,
      total: cartTotals.total,
      status: navigator.onLine ? "recorded" : "pending",
      createdAt: serverTimestamp(),
      cashierEmail: "demo@marco-pos.app",
      location: "Ela Beach Market",
      paymentMethod: "Cash",
    };

    if (navigator.onLine) {
      try {
        if (!firestore) {
          console.warn("Firestore unavailable — storing transaction offline");
          updateQueueStorage([...offlineQueue, payload]);
        } else {
          await addDoc(collection(firestore, "transactions"), payload);
        }
      } catch (error) {
        console.error(
          "Failed to create transaction online, storing offline",
          error,
        );
        updateQueueStorage([...offlineQueue, payload]);
      }
    } else {
      updateQueueStorage([...offlineQueue, payload]);
    }

    setCart([]);
    setDiscount(0);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-display">Product catalogue</h3>
            <p className="text-sm text-muted-foreground">
              Tap items to add to cart. Bundle deals apply automatically.
            </p>
          </div>
          <div
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              onlineStatus
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800",
            )}
          >
            <span className="inline-flex items-center gap-1">
              {onlineStatus ? (
                <Wifi className="h-3.5 w-3.5" />
              ) : (
                <WifiOff className="h-3.5 w-3.5" />
              )}
              {onlineStatus ? "Online" : "Offline mode"}
            </span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sampleProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleAddToCart(product)}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card text-left shadow-brand-soft transition-transform hover:-translate-y-1"
            >
              <div className="h-36 w-full overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    {product.name}
                  </p>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                    K{product.price}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{product.category}</span>
                  <span>{product.stock} in stock</span>
                </div>
                {product.bundle ? (
                  <div className="rounded-2xl bg-accent/40 px-3 py-1 text-xs font-medium text-accent-foreground">
                    <Layers3 className="mr-1 inline h-3.5 w-3.5" />{" "}
                    {product.bundle.quantity} for K{product.bundle.price}
                  </div>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </div>

      <aside className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card/95 p-4 shadow-brand">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Current sale
            </p>
            <h3 className="text-xl font-display">Cart total</h3>
          </div>
          <div className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            <ShoppingCart className="mr-2 inline h-3.5 w-3.5" /> {cart.length}{" "}
            items
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {cart.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="rounded-2xl border border-border/60 bg-white/80 p-3 shadow-brand-soft"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      K{item.product.price} / unit
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-border p-2 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(item.product.id)}
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-2 py-1">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.product.id, -1)}
                      className="rounded-full bg-white/70 p-1"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.product.id, 1)}
                      className="rounded-full bg-white/70 p-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      K
                      {cartTotals.cartItems
                        .find(
                          (cartItem) => cartItem.product.id === item.product.id,
                        )
                        ?.lineTotal.toFixed(2)}
                    </p>
                    {cartTotals.cartItems.find(
                      (cartItem) => cartItem.product.id === item.product.id,
                    )?.bundleApplied ? (
                      <p className="text-xs text-primary">
                        <Tag className="mr-1 inline h-3 w-3" /> Bundle applied
                      </p>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!cart.length ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-white/70 p-6 text-center text-sm text-muted-foreground">
              Tap a product to start building the order.
            </div>
          ) : null}
        </div>

        <div className="space-y-3 rounded-2xl border border-border/60 bg-white/80 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>K{cartTotals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tax (GST 10%)</span>
            <span>K{cartTotals.tax.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1">
              <PercentCircle className="h-4 w-4" /> Discount
            </span>
            <input
              type="number"
              min={0}
              max={20}
              value={discount}
              onChange={(event) => setDiscount(Number(event.target.value))}
              className="w-20 rounded-full border border-border bg-white px-3 py-1 text-right text-sm"
            />
          </div>
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span>Total</span>
            <span>K{cartTotals.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={submitTransaction}
            className="btn-primary w-full justify-center py-3 text-base"
          >
            <ArrowRight className="h-5 w-5" /> Checkout (Cash only)
          </button>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="btn-secondary justify-center gap-2"
              onClick={() => void handlePrintReceipt()}
              disabled={isPrinting}
              aria-busy={isPrinting}
            >
              <Printer className="h-4 w-4" />
              {isPrinting ? "Connecting printer..." : "Print receipt (Bluetooth)"}
            </button>
            <button
              type="button"
              className="btn-secondary justify-center gap-2"
              onClick={handleSendWhatsAppReceipt}
              disabled={isSendingReceipt}
              aria-busy={isSendingReceipt}
            >
              <MessageCircle className="h-4 w-4" />
              {isSendingReceipt ? "Preparing message..." : "Send WhatsApp receipt"}
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {offlineQueue.length} offline sale(s) ready to sync •{" "}
            {isSyncing ? "Syncing..." : "Automatic when online"}
          </p>
        </div>
      </aside>
    </div>
  );
};

export default POSCheckout;
