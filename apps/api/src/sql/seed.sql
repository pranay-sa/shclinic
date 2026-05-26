INSERT INTO clinics (code, name, city)
VALUES ('main', 'Sugar & Heart Main Clinic', 'Mumbai')
ON CONFLICT (code) DO NOTHING;

WITH c AS (
  SELECT id AS clinic_id FROM clinics WHERE code = 'main'
)
INSERT INTO users (full_name, username, password_hash, role)
VALUES
  ('Frontdesk Executive', 'frontdesk', crypt('password123', gen_salt('bf')), 'frontdesk_exec'),
  ('Dr Sandeep Reddy', 'doctor', crypt('password123', gen_salt('bf')), 'doctor'),
  ('Lab Technician', 'labtech', crypt('password123', gen_salt('bf')), 'lab_technician'),
  ('Clinic Admin', 'admin', crypt('password123', gen_salt('bf')), 'clinic_admin')
ON CONFLICT (username) DO NOTHING;

WITH c AS (
  SELECT id AS clinic_id FROM clinics WHERE code = 'main'
)
INSERT INTO user_clinics (user_id, clinic_id)
SELECT u.id, c.clinic_id
FROM users u, c
ON CONFLICT DO NOTHING;

WITH c AS (
  SELECT id AS clinic_id FROM clinics WHERE code = 'main'
)
INSERT INTO patients (
  patient_code, clinic_id, first_name, last_name, gender, date_of_birth, mobile, email, address_line, city, state, pin
)
SELECT * FROM (
  SELECT
    'PT-8821', c.clinic_id, 'Sarah', 'Montgomery', 'Female', DATE '1989-01-11', '+919820011221', 'sarah@example.com',
    '42 Lake View', 'Mumbai', 'Maharashtra', '400001' FROM c
  UNION ALL
  SELECT
    'PT-8822', c.clinic_id, 'James', 'Chen', 'Male', DATE '1975-06-14', '+919820011222', 'james@example.com',
    '12 Palm Road', 'Mumbai', 'Maharashtra', '400002' FROM c
  UNION ALL
  SELECT
    'PT-8823', c.clinic_id, 'Maria', 'Garcia', 'Female', DATE '1983-03-09', '+919820011223', 'maria@example.com',
    '9 Green Park', 'Mumbai', 'Maharashtra', '400003' FROM c
) x
ON CONFLICT (patient_code) DO NOTHING;

WITH
  c AS (SELECT id AS clinic_id FROM clinics WHERE code = 'main'),
  d AS (SELECT id AS doctor_id FROM users WHERE username = 'doctor'),
  p AS (
    SELECT id, patient_code FROM patients WHERE patient_code IN ('PT-8821', 'PT-8822', 'PT-8823')
  )
INSERT INTO appointments (appointment_code, clinic_id, patient_id, doctor_id, appointment_date, slot_time, visit_type, status)
SELECT * FROM (
  SELECT 'APT-1001', c.clinic_id, (SELECT id FROM p WHERE patient_code = 'PT-8821'), d.doctor_id, CURRENT_DATE, TIME '09:00', 'follow_up', 'booked' FROM c, d
  UNION ALL
  SELECT 'APT-1002', c.clinic_id, (SELECT id FROM p WHERE patient_code = 'PT-8822'), d.doctor_id, CURRENT_DATE, TIME '09:30', 'new', 'in_progress' FROM c, d
  UNION ALL
  SELECT 'APT-1003', c.clinic_id, (SELECT id FROM p WHERE patient_code = 'PT-8823'), d.doctor_id, CURRENT_DATE, TIME '10:00', 'follow_up', 'done' FROM c, d
) ap
ON CONFLICT (appointment_code) DO NOTHING;

WITH
  c AS (SELECT id AS clinic_id FROM clinics WHERE code = 'main'),
  d AS (SELECT id AS doctor_id FROM users WHERE username = 'doctor'),
  p AS (SELECT id, patient_code FROM patients WHERE patient_code IN ('PT-8821', 'PT-8822', 'PT-8823'))
INSERT INTO queue_entries (clinic_id, doctor_id, patient_id, status, position)
SELECT * FROM (
  SELECT c.clinic_id, d.doctor_id, (SELECT id FROM p WHERE patient_code = 'PT-8821'), 'waiting', 1 FROM c, d
  UNION ALL
  SELECT c.clinic_id, d.doctor_id, (SELECT id FROM p WHERE patient_code = 'PT-8822'), 'waiting', 2 FROM c, d
  UNION ALL
  SELECT c.clinic_id, d.doctor_id, (SELECT id FROM p WHERE patient_code = 'PT-8823'), 'waiting', 3 FROM c, d
) q
ON CONFLICT DO NOTHING;

WITH
  c AS (SELECT id AS clinic_id FROM clinics WHERE code = 'main'),
  p AS (SELECT id FROM patients WHERE patient_code = 'PT-8821')
INSERT INTO lab_orders (order_code, clinic_id, patient_id, eta_at, category, tests, sample_id, sample_status, process_status, report_status)
SELECT * FROM (
  SELECT
    'ORD-88392', c.clinic_id, p.id, NOW() + INTERVAL '2 hour', 'Image & Text tests',
    '["HBA1C","Lipid Profile","2D echo"]'::jsonb, 'SMP-104F', 'active', 'pending', 'pending'
  FROM c, p
  UNION ALL
  SELECT
    'ORD-88393', c.clinic_id, p.id, NOW() + INTERVAL '3 hour', 'Text tests',
    '["HBA1C"]'::jsonb, 'SMP-105R', 'done', 'active', 'pending'
  FROM c, p
) lo
ON CONFLICT (order_code) DO NOTHING;

WITH
  c AS (SELECT id AS clinic_id FROM clinics WHERE code = 'main'),
  p AS (SELECT id FROM patients WHERE patient_code = 'PT-8821'),
  d AS (SELECT id AS doctor_id FROM users WHERE username = 'doctor')
INSERT INTO medical_records (clinic_id, patient_id, author_user_id, record_type, title, ref_code, source, file_name, metadata)
SELECT * FROM (
  SELECT c.clinic_id, p.id, d.doctor_id, 'prescription', 'Dr Sandeep Reddy', 'RX-24102026001', 'S&H', 'prescription_name.pdf', '{}'::jsonb FROM c, p, d
  UNION ALL
  SELECT c.clinic_id, p.id, d.doctor_id, 'bill', 'Consultation', 'BILL-24102026001', 'S&H', 'bill_one.pdf', '{}'::jsonb FROM c, p, d
  UNION ALL
  SELECT c.clinic_id, p.id, d.doctor_id, 'text_report', 'Lipid Profile', 'REP-24102026001', 'S&H', 'lipid_test.pdf', '{}'::jsonb FROM c, p, d
) mr
ON CONFLICT DO NOTHING;
