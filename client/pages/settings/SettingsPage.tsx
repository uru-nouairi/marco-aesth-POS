import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Smartphone, CloudUpload, Bell } from "lucide-react";

const SettingsPage = () => {
  const [pwaEnabled, setPwaEnabled] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("+675 7000 1000");
  const [backupEmail, setBackupEmail] = useState("finance@marcoaesthetics.png");

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-3xl bg-card/90 p-6">
        <h2 className="text-2xl font-display text-foreground">
          System preferences
        </h2>
        <p className="text-sm text-muted-foreground">
          Fine tune mobile POS sync, WhatsApp messaging, and automated Firestore
          backups.
        </p>
      </section>

      <section className="surface-muted space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display">Offline-first PWA</h3>
            <p className="text-sm text-muted-foreground">
              Installable app with IndexedDB storage for stalls without
              connectivity.
            </p>
          </div>
          <Switch
            checked={pwaEnabled}
            onCheckedChange={setPwaEnabled}
            aria-label="Toggle PWA mode"
          />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/90 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Status</p>
          <p className="mt-1 flex items-center gap-2 text-xs">
            <Smartphone className="h-4 w-4 text-primary" /> Devices installed: 4
            • Last sync 12 mins ago
          </p>
        </div>
      </section>

      <section className="surface-muted space-y-6 p-6">
        <div className="space-y-2">
          <h3 className="text-lg font-display">WhatsApp automation</h3>
          <p className="text-sm text-muted-foreground">
            Send receipts, daily summaries, and expired loyalty alerts.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="whatsapp-number">Primary WhatsApp number</Label>
            <Input
              id="whatsapp-number"
              value={whatsappNumber}
              onChange={(event) => setWhatsappNumber(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="backup-email">Backup email for transcripts</Label>
            <Input
              id="backup-email"
              type="email"
              value={backupEmail}
              onChange={(event) => setBackupEmail(event.target.value)}
            />
          </div>
        </div>
        <Button type="button" className="btn-secondary w-fit">
          <Bell className="mr-2 h-4 w-4" /> Send test notification
        </Button>
      </section>

      <section className="surface-muted space-y-6 p-6">
        <div className="space-y-2">
          <h3 className="text-lg font-display">Cloud backups</h3>
          <p className="text-sm text-muted-foreground">
            Automated Firestore export emailed weekly to the owner.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="backup-day">Backup schedule</Label>
            <Input id="backup-day" defaultValue="Sunday 8:00 PM" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storage-bucket">Storage bucket</Label>
            <Input id="storage-bucket" defaultValue="gs://marco-pos-backups" />
          </div>
        </div>
        <Separator className="bg-border/70" />
        <Button type="button" className="btn-primary w-fit">
          <CloudUpload className="mr-2 h-4 w-4" /> Run immediate backup
        </Button>
      </section>

      <div className="flex justify-end">
        <Button type="button" className="btn-primary">
          <Save className="mr-2 h-4 w-4" /> Save preferences
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
