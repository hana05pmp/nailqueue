import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/salon/PageShell";
import { StaffGuard } from "@/components/salon/StaffGuard";
import { deleteService, newServiceId, saveService, toggleService, useSalonState } from "@/lib/salon/store";
import type { Service } from "@/lib/salon/types";

export const Route = createFileRoute("/staff/services")({ component: ServicesPage });

const emptyService = (): Service => ({ id: newServiceId(), name: "", description: "", durationMin: 30, price: 25, active: true });

function ServicesPage() {
  const state = useSalonState();
  const [draft, setDraft] = useState<Service | null>(null);

  function edit(service: Service) { setDraft({ ...service }); }
  function save() {
    if (!draft?.name.trim()) return toast.error("Service name is required");
    if (draft.durationMin <= 0 || draft.price < 0) return toast.error("Enter valid duration and price");
    saveService({ ...draft, name: draft.name.trim() });
    setDraft(null);
    toast.success("Service saved");
  }

  return <StaffGuard><PageShell title="Services" subtitle="Manage the services customers can join the queue for.">
    <div className="mb-6"><Button onClick={() => setDraft(emptyService())}>Add service</Button></div>
    {draft && <Card className="mb-6"><CardContent className="grid gap-4 p-6 sm:grid-cols-2"><div className="space-y-2"><Label>Name</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div><div className="space-y-2"><Label>Description</Label><Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div><div className="space-y-2"><Label>Duration (minutes)</Label><Input type="number" min="1" value={draft.durationMin} onChange={(e) => setDraft({ ...draft, durationMin: Number(e.target.value) })} /></div><div className="space-y-2"><Label>Price</Label><Input type="number" min="0" step="0.01" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} /></div><div className="flex gap-2 sm:col-span-2"><Button onClick={save}>Save</Button><Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button></div></CardContent></Card>}
    <div className="space-y-4">{state.services.map((service) => <Card key={service.id}><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><div><div className="flex items-center gap-2"><h2 className="font-semibold">{service.name}</h2><span className="text-xs text-muted-foreground">{service.active ? "Active" : "Hidden"}</span></div><p className="text-sm text-muted-foreground">{service.description}</p><p className="mt-1 text-sm">{service.durationMin} min · ${service.price}</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => toggleService(service.id)}>{service.active ? "Disable" : "Enable"}</Button><Button variant="outline" onClick={() => edit(service)}>Edit</Button><Button variant="destructive" onClick={() => { deleteService(service.id); toast.success("Service deleted"); }}>Delete</Button></div></CardContent></Card>)}</div>
  </PageShell></StaffGuard>;
}
