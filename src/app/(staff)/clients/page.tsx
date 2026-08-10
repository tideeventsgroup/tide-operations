import Link from "next/link";
import { Building2, Check, Minus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

const STATUS_STYLES: Record<string, string> = {
  prospect: "bg-warning-bg text-warning",
  active: "bg-success-bg text-success",
  past: "bg-muted text-muted-foreground",
};

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: organisations, error } = await supabase
    .from("organisations")
    .select("id, name, relationship_status, portal_access_enabled, contacts(count), events(count)")
    .order("name");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Clients"
        description="Organisations Tide works with, independent of any single event."
        actions={
          <Button render={<Link href="/clients/new" />} nativeButton={false} size="sm">
            <Plus className="size-4" />
            New client
          </Button>
        }
      />

      {error && <p className="mb-4 text-sm text-destructive">{error.message}</p>}

      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          {organisations?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organisation</TableHead>
                  <TableHead className="text-right">Contacts</TableHead>
                  <TableHead className="text-right">Events</TableHead>
                  <TableHead className="text-center">Portal</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organisations.map((org) => {
                  const contactCount = (org.contacts as { count: number }[] | null)?.[0]?.count ?? 0;
                  const eventCount = (org.events as { count: number }[] | null)?.[0]?.count ?? 0;
                  return (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium text-tide-charcoal">
                        <Link href={`/clients/${org.id}`} className="block">
                          {org.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground tabular-nums">{contactCount}</TableCell>
                      <TableCell className="text-right text-muted-foreground tabular-nums">{eventCount}</TableCell>
                      <TableCell className="text-center">
                        {org.portal_access_enabled ? (
                          <Check className="mx-auto size-3.5 text-success" />
                        ) : (
                          <Minus className="mx-auto size-3.5 text-muted-foreground/40" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={STATUS_STYLES[org.relationship_status]}>
                          {org.relationship_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
