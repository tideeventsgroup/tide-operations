-- Trigger-only function, same fix as 0010 applied to generate_document_reference().
revoke execute on function generate_incident_number() from public, anon, authenticated;
