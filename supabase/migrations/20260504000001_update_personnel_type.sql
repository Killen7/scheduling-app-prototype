-- Rename type → personnel_type to align with domain model.
-- Values stay the same: 'provider' | 'clinical' | 'non-clinical'

ALTER TABLE personnel RENAME COLUMN type TO personnel_type;
