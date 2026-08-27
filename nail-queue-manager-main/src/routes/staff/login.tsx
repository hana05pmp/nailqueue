import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/salon/PageShell";
import { staffLogin, useSalonState } from "@/lib/salon/store";

export const Route = createFileRoute("/staff/login")({ component: StaffLoginPage });

function StaffLoginPage() {
  const state = useSalonState();
  const navigate = useNavigate();
  const [username, setUsername] = useState("staff");
  const [password, setPassword] = useState("polish123");

  if (state.staffLoggedIn) {
    navigate({ to: "/staff/dashboard", replace: true });
    return null;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = staffLogin(username, password);
    if (!ok) {
      toast.error("Invalid username or password.");
      return;
    }
    toast.success("Staff login successful");
    navigate({ to: "/staff/dashboard", replace: true });
  }

  return (
    <PageShell title="Staff login" subtitle="Sign in to manage the live salon queue.">
      <div className="mx-auto max-w-md">
        <Card>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              </div>
              <Button className="w-full" size="lg" type="submit">Sign in</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
