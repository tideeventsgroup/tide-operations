-- Matches the established pattern for documents.reference: nullable + unique,
-- populated by a before-insert trigger. Keeping it NOT NULL made the
-- generated TypeScript Insert type require a value the trigger actually
-- supplies, forcing callers to pass a dummy one.
alter table incidents alter column incident_number drop not null;
