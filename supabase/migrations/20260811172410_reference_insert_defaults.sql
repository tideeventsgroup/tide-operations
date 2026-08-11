-- Supabase's generated Insert type treats NOT NULL columns without defaults
-- as client-required. The BEFORE INSERT triggers always replace these empty
-- placeholders with the next permanent reference.
alter table public.organisations alter column client_reference set default '';
alter table public.events alter column event_reference set default '';
