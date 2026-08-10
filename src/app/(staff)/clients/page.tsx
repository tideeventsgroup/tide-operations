import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ListRow } from "@/components/list-row";

const STATUS_STYLES: Record<string, string> = {
  prospect: "bg-warning-bg text-warning",
  active: "bg-success-bg text-success",
  past: "bg-muted text-muted-foreground",
};

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: organisations, error } = await supabase
    .from("organisations")
    .select("id, name, relationship_status, portal_access_enabled")
    .order("name");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Clients"
        description="Organisations Tide works with, independent of any single event."
        actions={
          <Button render={<Link href="/clients/new" />} nativeButton={false}>
            <Plus className="size-4" />
            New client
          </Button>
        }
      />

      {error && <p className="mb-4 text-sm text-destructive">{error.message}</p>}

      <Card className="gap-0 py-0">
        <CardContent className="px-0 py-1">
          {organisations?.length ? (
            <div className="divide-y">
              {organisations.map((org) => (
                <ListRow
                  key={org.id}
                  href={`/clients/${org.id}`}
                  icon={Building2}
                  iconTone="charcoal"
                  title={org.name}
                  subtitle={org.portal_access_enabled ? "Portal access enabled" : undefined}
                  trailing={
                    <Badge variant="outline" className={STATUS_STYLES[org.relationship_status]}>
                      {org.relationship_status}
                    </Badge>
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="No clients yet"
              description="Add the first organisation Tide works with."
              className="border-none py-14"
              action={
                <Button render={<Link href="/clients/new" />} nativeButton={false} size="sm">
                  <Plus className="size-4" />
                  New client
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
