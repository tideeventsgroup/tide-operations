-- Seed the OSSP master template (section 6.5/6.6): the first end-to-end
-- Document Studio template. structure_json drives the schema-driven form
-- renderer — adding a new document type later means a new template row,
-- not new editor code (section 7.3).

insert into document_templates (name, code, output_format, status, version, structure_json)
values (
  'Operational & Safety/Site Plan (OSSP)',
  'OSSP',
  'a4',
  'published',
  1,
  '{
    "sections": [
      {
        "key": "document_control",
        "number": "1",
        "title": "Document Control",
        "fields": [
          {"key": "document_title", "label": "Document title", "type": "event_variable", "variable": "event.name", "suffix": " — Operational & Safety Plan", "required": true},
          {"key": "prepared_by", "label": "Prepared by", "type": "text", "required": true},
          {"key": "distribution_list", "label": "Distribution list", "type": "textarea", "required": false}
        ]
      },
      {
        "key": "event_overview",
        "number": "2",
        "title": "Event Overview",
        "fields": [
          {"key": "venue", "label": "Venue", "type": "event_variable", "variable": "venue.name", "required": true},
          {"key": "event_dates", "label": "Event dates", "type": "event_variable", "variable": "event.dates", "required": true},
          {"key": "expected_attendance", "label": "Expected attendance", "type": "event_variable", "variable": "event.expected_attendance", "required": true},
          {"key": "event_manager", "label": "Event manager", "type": "event_variable", "variable": "event.manager", "required": true},
          {"key": "control_location", "label": "Control location", "type": "event_variable", "variable": "event.control", "required": true},
          {"key": "event_description", "label": "Event description", "type": "textarea", "required": true}
        ]
      },
      {
        "key": "key_contacts",
        "number": "3",
        "title": "Key Contacts & Roles",
        "fields": [
          {"key": "contacts_table", "label": "Key contacts", "type": "table", "columns": ["Role", "Name", "Contact number"], "required": true}
        ]
      },
      {
        "key": "command_and_communication",
        "number": "4",
        "title": "Command & Communication",
        "fields": [
          {"key": "command_structure", "label": "Command structure", "type": "textarea", "required": true},
          {"key": "radio_procedure", "label": "Radio voice procedure", "type": "knowledge_block_ref", "category": "Command & Communication", "required": false},
          {"key": "escalation_procedure", "label": "Escalation procedure", "type": "knowledge_block_ref", "category": "Command & Communication", "required": false}
        ]
      },
      {
        "key": "hazard_register_summary",
        "number": "5",
        "title": "Hazard Register Summary",
        "fields": [
          {"key": "hazard_table", "label": "Hazard register (R01–R14 where applicable)", "type": "table", "columns": ["Ref", "Hazard", "Likelihood", "Severity", "Control measures"], "required": true}
        ]
      },
      {
        "key": "crowd_management",
        "number": "6",
        "title": "Crowd Management",
        "fields": [
          {"key": "crowd_management_principles", "label": "Crowd management principles", "type": "knowledge_block_ref", "category": "Crowd Management", "required": false},
          {"key": "capacity_limits", "label": "Capacity limits", "type": "textarea", "required": true},
          {"key": "entry_exit_points", "label": "Entry / exit points", "type": "textarea", "required": true}
        ]
      },
      {
        "key": "traffic_and_transport",
        "number": "7",
        "title": "Traffic & Transport",
        "fields": [
          {"key": "traffic_management_plan", "label": "Traffic management plan", "type": "textarea", "required": true},
          {"key": "parking_arrangements", "label": "Parking arrangements", "type": "textarea", "required": false}
        ]
      },
      {
        "key": "medical_and_welfare",
        "number": "8",
        "title": "Medical & Welfare",
        "fields": [
          {"key": "medical_provision", "label": "Medical provision", "type": "textarea", "required": true},
          {"key": "welfare_procedures", "label": "Welfare procedures", "type": "knowledge_block_ref", "category": "Welfare", "required": false},
          {"key": "lost_child_procedure", "label": "Lost child procedure", "type": "knowledge_block_ref", "category": "Welfare", "required": false}
        ]
      },
      {
        "key": "emergency_procedures",
        "number": "9",
        "title": "Emergency Procedures",
        "fields": [
          {"key": "evacuation_arrangements", "label": "Evacuation arrangements", "type": "knowledge_block_ref", "category": "Emergency Procedures", "required": false},
          {"key": "major_incident_procedure", "label": "Major incident procedure", "type": "textarea", "required": true},
          {"key": "emergency_services_liaison", "label": "Emergency services liaison", "type": "textarea", "required": true}
        ]
      },
      {
        "key": "adverse_weather_and_contingency",
        "number": "10",
        "title": "Adverse Weather & Contingency",
        "fields": [
          {"key": "adverse_weather_plan", "label": "Adverse weather plan", "type": "textarea", "required": true},
          {"key": "cancellation_criteria", "label": "Cancellation / abandonment criteria", "type": "textarea", "required": true}
        ]
      },
      {
        "key": "appendices",
        "number": "11",
        "title": "Appendices",
        "fields": [
          {"key": "appendix_table", "label": "Appendices", "type": "table", "columns": ["Appendix", "Title", "Reference"], "required": false}
        ]
      }
    ]
  }'::jsonb
);
