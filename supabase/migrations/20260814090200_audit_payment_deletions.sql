-- Audit finding (Medium): commercial_activity logs status changes on
-- opportunities/proposals/quotes/invoices (see log_commercial_status_change,
-- 20260811210512_commercial_business_system.sql), but a deleted `payments`
-- row leaves no trace anywhere, even though its deletion silently changes the
-- parent invoice's status/balance via recalculate_invoice_payments(). This
-- adds the missing audit entry, reusing the same commercial_activity table
-- and 'invoice' entity_label the existing trigger already uses for that
-- entity type.

create or replace function public.log_payment_deletion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.commercial_activity(entity_type, entity_id, action, note, actor_id)
  values (
    'invoice',
    old.invoice_id,
    'payment_deleted',
    format(
      'Payment %s of %s (%s, paid %s) deleted',
      coalesce(old.payment_reference, old.id::text),
      old.amount,
      old.method,
      old.paid_on
    ),
    auth.uid()
  );
  return old;
end;
$$;

create trigger payment_deletion_audit before delete on public.payments
for each row execute function public.log_payment_deletion();

revoke execute on function public.log_payment_deletion() from public, anon, authenticated;
