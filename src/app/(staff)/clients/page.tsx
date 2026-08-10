import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_STYLES: Record<string, string> = {
  prospect: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  past: "bg-muted text-muted-foreground",
};

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: organisations, error } = await supabase
    .from("organisations")
    .select("id, name, relationship_status, portal_access_enabled")
    .order("name");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-tide-charcoal">Clients</h1>
          <p className="text-sm text-muted-foreground">Organisations Tide works with, independent of any single event.</p>
        </div>
        <Button render={<Link href="/clients/new" />} nativeButton={false}>New client</Button>
      </div>

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <Card>
        <CardContent className="divide-y p-0">
          {organisations?.length ? (
            organisations.map((org) => (
              <Link
                key={org.id}
                href={`/clients/${org.id}`}
                className="flex items-center justify-between gap-4 p-4 text-sm transition-colors hover:bg-accent"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-tide-charcoal">{org.name}</div>
                  {org.portal_access_enabled && (
                    <div className="text-xs text-muted-foreground">Portal access enabled</div>
                  )}
                </div>
                <Badge variant="outline" className={STATUS_STYLES[org.relationship_status]}>
                  {org.relationship_status}
                </Badge>
              </Link>
            ))
          ) : (
            <p className="p-6 text-sm text-muted-foreground">
              No clients yet. <Link href="/clients/new" className="text-tide-teal underline">Add the first one.</Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
