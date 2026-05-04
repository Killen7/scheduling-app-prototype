-- Replace date + schedule string + direct FKs with
-- personnel_office_id + proper start/end timestamps.

-- 1. Add new columns (nullable for the migration window)
ALTER TABLE shifts
  ADD COLUMN personnel_office_id UUID REFERENCES personnel_offices(id) ON DELETE CASCADE,
  ADD COLUMN start_at            TIMESTAMPTZ,
  ADD COLUMN end_at              TIMESTAMPTZ;

-- 2. Migrate timestamps from "YYYY-MM-DD" + "H:MM AM - H:MM PM"
--    PostgreSQL can cast '8:00 AM'::time natively.
UPDATE shifts
SET
  start_at = (date + trim(split_part(schedule, ' - ', 1))::time) AT TIME ZONE 'UTC',
  end_at   = (date + trim(split_part(schedule, ' - ', 2))::time) AT TIME ZONE 'UTC';

-- 3. Set the new FK
UPDATE shifts s
SET personnel_office_id = po.id
FROM personnel_offices po
WHERE s.personnel_id = po.personnel_id
  AND s.office_id    = po.office_id;

-- 4. Enforce NOT NULL now that data is populated
ALTER TABLE shifts
  ALTER COLUMN personnel_office_id SET NOT NULL,
  ALTER COLUMN start_at            SET NOT NULL,
  ALTER COLUMN end_at              SET NOT NULL;

-- 5. Drop legacy columns
ALTER TABLE shifts
  DROP COLUMN date,
  DROP COLUMN schedule,
  DROP COLUMN personnel_id,
  DROP COLUMN office_id;
