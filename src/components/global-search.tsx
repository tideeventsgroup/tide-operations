"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, CalendarDays, Siren, FileText, Building2 } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchWorkspace, type SearchResults } from "@/lib/actions/search";

const EMPTY: SearchResults = { events: [], incidents: [], documents: [], clients: [] };

export function GlobalSearchTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("tide:open-search"))}
      className={
        className ??
        "flex min-h-10 w-full items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white/80"
      }
    >
      <Search className="size-[15px]" />
      <span className="flex-1 text-left">Search…</span>
      <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-white/40">⌘K</kbd>
    </button>
  );
}

/**
 * Mount once per app shell (staff layout). Owns the dialog + keyboard
 * shortcut; GlobalSearchTrigger buttons elsewhere just dispatch an event so
 * there's a single source of truth for open/close state instead of prop
 * drilling through the sidebar and the mobile sheet separately.
 */
export function GlobalSearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    function onOpenEvent() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("tide:open-search", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("tide:open-search", onOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) return;
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const next = await searchWorkspace(query);
        setResults(next);
      });
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.trim().length < 2) setResults(EMPTY);
  }

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const hasResults =
    results.events.length + results.incidents.length + results.documents.length + results.clients.length > 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Search events, incidents, documents and clients"
    >
      <CommandInput placeholder="Search events, incidents, documents, clients…" value={query} onValueChange={handleQueryChange} />
      <CommandList>
        {query.trim().length < 2 && <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>}
        {query.trim().length >= 2 && !isPending && !hasResults && <CommandEmpty>No results for &ldquo;{query}&rdquo;.</CommandEmpty>}
        {results.events.length > 0 && (
          <CommandGroup heading="Events">
            {results.events.map((r) => (
              <CommandItem key={r.id} value={`event-${r.id}-${r.label}`} onSelect={() => go(r.href)}>
                <CalendarDays className="text-tide-teal" />
                <span className="min-w-0 flex-1 truncate">{r.label}</span>
                {r.sublabel && <span className="truncate text-xs text-muted-foreground">{r.sublabel}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {results.incidents.length > 0 && (
          <CommandGroup heading="Incidents">
            {results.incidents.map((r) => (
              <CommandItem key={r.id} value={`incident-${r.id}-${r.label}`} onSelect={() => go(r.href)}>
                <Siren className="text-destructive" />
                <span className="min-w-0 flex-1 truncate">{r.label}</span>
                {r.sublabel && <span className="truncate text-xs text-muted-foreground">{r.sublabel}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {results.documents.length > 0 && (
          <CommandGroup heading="Documents">
            {results.documents.map((r) => (
              <CommandItem key={r.id} value={`document-${r.id}-${r.label}`} onSelect={() => go(r.href)}>
                <FileText className="text-tide-teal" />
                <span className="min-w-0 flex-1 truncate">{r.label}</span>
                {r.sublabel && <span className="truncate text-xs text-muted-foreground">{r.sublabel}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {results.clients.length > 0 && (
          <CommandGroup heading="Clients">
            {results.clients.map((r) => (
              <CommandItem key={r.id} value={`client-${r.id}-${r.label}`} onSelect={() => go(r.href)}>
                <Building2 className="text-tide-teal" />
                <span className="min-w-0 flex-1 truncate">{r.label}</span>
                {r.sublabel && <span className="truncate text-xs text-muted-foreground">{r.sublabel}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
