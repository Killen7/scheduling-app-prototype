-- Join table that assigns Personnel to Offices.
-- Shifts will reference this instead of holding personnel_id + office_id directly.

CREATE TABLE personnel_offices (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id UUID        NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
  office_id    UUID        NOT NULL REFERENCES offices(id)   ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_personnel_office UNIQUE (personnel_id, office_id)
);

ALTER TABLE personnel_offices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON personnel_offices FOR ALL USING (true) WITH CHECK (true);

-- Seed from existing shifts so no data is orphaned after migration 3.
INSERT INTO personnel_offices (personnel_id, office_id)
SELECT DISTINCT personnel_id, office_id
FROM   shifts
WHERE  personnel_id IS NOT NULL
  AND  office_id    IS NOT NULL
ON CONFLICT DO NOTHING;
