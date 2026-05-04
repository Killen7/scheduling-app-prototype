-- PTO records assigned directly to a Personnel member.

CREATE TABLE pto (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id UUID        NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  reason       TEXT,
  start_at     TIMESTAMPTZ NOT NULL,
  end_at       TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE pto ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON pto FOR ALL USING (true) WITH CHECK (true);
