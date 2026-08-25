import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSalonState } from "@/lib/salon/store";

export function StaffGuard({ children }: { children: React.ReactNode }) {
  const state = useSalonState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.staffLoggedIn) {
      navigate({ to: "/staff/login", replace: true });
    }
  }, [navigate, state.staffLoggedIn]);

  if (!state.staffLoggedIn) return null;
  return children;
}
