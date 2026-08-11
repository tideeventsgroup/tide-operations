-- Position Tide as a transparent, affordable regional specialist. These are
-- standard starting prices excluding VAT; complex or multi-day work remains
-- subject to scope, travel and event risk.
update public.business_services
set
  default_unit_price = case code
    when 'ESMP' then 950
    when 'CTRL' then 450
    when 'ESM' then 425
    when 'RA' then 350
    when 'CROWD' then 650
    when 'RADIO' then 325
    when 'INC' then 450
    when 'DOC' then 325
    when 'OSM' then 425
    when 'DEBRIEF' then 275
    else default_unit_price
  end,
  unit_label = case code
    when 'CTRL' then 'event day'
    when 'INC' then 'event day'
    when 'ESM' then 'day'
    when 'OSM' then 'day'
    else unit_label
  end
where code in ('ESMP', 'CTRL', 'ESM', 'RA', 'CROWD', 'RADIO', 'INC', 'DOC', 'OSM', 'DEBRIEF');

insert into public.business_services
  (code, name, category, description, unit_label, default_unit_price, tax_rate)
values
  (
    'STARTER',
    'Small Event Safety Starter Pack',
    'Planning & Safety',
    'A proportionate starter pack for a small, lower-risk event: planning review, event-specific risk assessment, emergency arrangements outline and one client review call.',
    'pack',
    495,
    20
  ),
  (
    'FULL-PACK',
    'Complete Event Safety Planning Pack',
    'Planning & Safety',
    'An integrated planning pack for a medium-complexity event, combining the Event Safety Management Plan, risk assessment, crowd arrangements and radio communications plan. Final scope depends on venue, attendance and risk profile.',
    'pack',
    1650,
    20
  )
on conflict (code) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  unit_label = excluded.unit_label,
  default_unit_price = excluded.default_unit_price,
  tax_rate = excluded.tax_rate,
  active = true;
