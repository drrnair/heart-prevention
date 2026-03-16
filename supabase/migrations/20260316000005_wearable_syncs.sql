-- Wearable sync data from Apple Health and Google Fit

CREATE TABLE wearable_syncs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('apple_health', 'google_fit')),
  data_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_wearable_sync UNIQUE (user_id, source, data_type, recorded_at)
);

CREATE INDEX idx_wearable_syncs_user_type ON wearable_syncs(user_id, data_type, recorded_at DESC);

ALTER TABLE wearable_syncs ENABLE ROW LEVEL SECURITY;

CREATE POLICY wearable_syncs_select ON wearable_syncs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY wearable_syncs_insert ON wearable_syncs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY wearable_syncs_delete ON wearable_syncs FOR DELETE TO authenticated USING (user_id = auth.uid());
