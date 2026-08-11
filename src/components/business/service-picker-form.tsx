import { Library, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/business";

type Service = {
  id: string;
  code: string;
  name: string;
  category: string;
  default_unit_price: number;
  unit_label: string;
};

export function ServicePickerForm({ action, parentName, parentId, services }: { action: (formData: FormData) => void | Promise<void>; parentName: "quote_id" | "invoice_id" | "proposal_id"; parentId: string; services: Service[] }) {
  return <details className="group rounded-xl border bg-white">
    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-tide-charcoal marker:hidden">
      <span className="flex items-center gap-2"><Library className="size-4 text-tide-teal" />Add from service catalogue</span>
      <Plus className="size-4 text-muted-foreground transition-transform group-open:rotate-45" />
    </summary>
    <form action={action} className="flex flex-col gap-3 border-t bg-tide-teal/[0.045] p-4 sm:flex-row sm:items-end">
      <input type="hidden" name={parentName} value={parentId} />
      <div className="min-w-0 flex-1"><label htmlFor={`service-${parentId}`} className="mb-1.5 block text-xs font-semibold text-muted-foreground">Saved Tide service</label><select id={`service-${parentId}`} name="service_id" required className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm"><option value="">Choose a service</option>{services.map((service) => <option key={service.id} value={service.id}>{service.code} · {service.name} · {service.default_unit_price > 0 ? `${formatMoney(service.default_unit_price)} / ${service.unit_label}` : "Price on application"}</option>)}</select></div>
      <Button type="submit" size="sm"><Plus />Add service</Button>
    </form>
  </details>;
}
