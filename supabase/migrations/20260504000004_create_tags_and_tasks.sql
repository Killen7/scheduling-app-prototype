-- Tags: free-form labels that can be attached to shifts.

CREATE TABLE tags (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON tags FOR ALL USING (true) WITH CHECK (true);


-- Tasks: definitions of work items that can be attached to shifts.
-- is_provider_attached = true means the assignment must also carry
-- a provider_shift_id referencing the provider who owns the task.

CREATE TABLE tasks (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT        NOT NULL,
  is_provider_attached BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON tasks FOR ALL USING (true) WITH CHECK (true);
