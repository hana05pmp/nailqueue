import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { staffLogout, useSalon } from "@/lib/salon/store";

const customerLinks = [
  { to: "/", label: "Home" },
  { to: "/booking", label: "Booking" },
  { to: "/my-bookings", label: "My Bookings" },
  { to: "/join", label: "Join Queue" },
  { to: "/my-queue", label: "My Queue" },
] as const;

const staffLinks = [
  { to: "/staff/dashboard", label: "Dashboard" },
  { to: "/staff/dashboard", label: "Queue" },
  { to: "/staff/services", label: "Services" },
  { to: "/staff/analytics", label: "Analytics" },
] as const;

export function SiteHeader() {
  const loggedIn = useSalon((s) => s.staffLoggedIn);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const links = loggedIn ? staffLinks : customerLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">The Nail Room</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={`${l.to}-${l.label}`}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex">
          {loggedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                staffLogout();
                navigate({ to: "/" });
              }}
            >
              Sign out
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/staff/login">Staff login</Link>
            </Button>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline" size="icon" aria-label="Open menu">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-6">
            <nav className="mt-8 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={`${l.to}-${l.label}`}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: l.to === "/" }}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "bg-secondary text-foreground" }}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-4">
                {loggedIn ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      staffLogout();
                      setOpen(false);
                      navigate({ to: "/" });
                    }}
                  >
                    Sign out
                  </Button>
                ) : (
                  <Button asChild className="w-full" onClick={() => setOpen(false)}>
                    <Link to="/staff/login">Staff login</Link>
                  </Button>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
