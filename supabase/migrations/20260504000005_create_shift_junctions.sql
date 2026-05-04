-- shift_tags: many-to-many between Shift and Tag.

CREATE TABLE shift_tags (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id   UUID        NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  tag_id     UUID        NOT NULL REFERENCES tags(id)   ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_shift_tag UNIQUE (shift_id, tag_id)
);

ALTER TABLE shift_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON shift_tags FOR ALL USING (true) WITH CHECK (true);


-- shift_tasks: many-to-many between Shift and Task.
-- provider_shift_id is required (enforced at the application layer) when
-- the referenced task has is_provider_attached = true.

CREATE TABLE shift_tasks (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id          UUID        NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  task_id           UUID        NOT NULL REFERENCES tasks(id)  ON DELETE CASCADE,
  provider_shift_id UUID                 REFERENCES shifts(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_shift_task UNIQUE (shift_id, task_id)
);

ALTER TABLE shift_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON shift_tasks FOR ALL USING (true) WITH CHECK (true);
