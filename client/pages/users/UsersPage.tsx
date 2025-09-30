import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, KeyRound, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UserRow {
  uid: string;
  email: string;
  role: "owner" | "cashier";
  status: "active" | "invited" | "suspended";
  createdAt: string;
}

const seedUsers: UserRow[] = [
  {
    uid: "1",
    email: "owner@marcoaesthetics.png",
    role: "owner",
    status: "active",
    createdAt: "Jan 01, 2025",
  },
  {
    uid: "2",
    email: "marian@marco-pos.app",
    role: "cashier",
    status: "active",
    createdAt: "Jan 03, 2025",
  },
  {
    uid: "3",
    email: "jesse@marco-pos.app",
    role: "cashier",
    status: "invited",
    createdAt: "Jan 08, 2025",
  },
];

const UsersPage = () => {
  const [users, setUsers] = useState(seedUsers);
  const { resetCashierPin, createUserAccount } = useAuth();
  const [isInviting, setIsInviting] = useState(false);

  const handleCreateUser = async () => {
    setIsInviting(true);
    const tempEmail = `cashier${Math.random().toString(16).slice(2, 6)}@marco-pos.app`;
    try {
      await createUserAccount({
        email: tempEmail,
        password: "CashierTemp123!",
        role: "cashier",
      });
      setUsers((prev) => [
        ...prev,
        {
          uid: crypto.randomUUID(),
          email: tempEmail,
          role: "cashier",
          status: "invited",
          createdAt: new Date().toLocaleDateString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to create cashier", error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleResetPin = async (uid: string) => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    await resetCashierPin(uid, newPin);
    alert(`Temporary PIN for cashier ${uid}: ${newPin}`);
  };

  return (
    <div className="space-y-6">
      <section className="glass-panel flex flex-col gap-4 rounded-3xl bg-card/90 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-display text-foreground">
            Team control
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage cashier access, reset pins instantly, and keep the owner
            credentials secure.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            className="btn-secondary"
            onClick={handleCreateUser}
            disabled={isInviting}
          >
            <Plus className="mr-2 h-4 w-4" />{" "}
            {isInviting ? "Creating..." : "Invite cashier"}
          </Button>
          <Button type="button" className="btn-primary">
            <UserCheck className="mr-2 h-4 w-4" /> Audit log
          </Button>
        </div>
      </section>

      <section className="surface-muted space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display">User roster</h3>
          <Badge className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
            {users.length} users
          </Badge>
        </div>
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-white/85 shadow-brand-soft">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "secondary"
                      }
                      className="rounded-full px-3 py-1 text-xs"
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell>
                    {user.role === "cashier" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetPin(user.uid)}
                      >
                        <KeyRound className="mr-2 h-4 w-4" /> Reset PIN
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Owner secured
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};

export default UsersPage;
