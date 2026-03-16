-- =============================================================================
-- Heart Prevention App — Storage Buckets & Policies
-- Migration: 00003_storage_buckets.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Create storage buckets
-- ---------------------------------------------------------------------------

-- Lab report images (uploaded by users for OCR extraction)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lab-reports',
  'lab-reports',
  false,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Imaging report uploads (CAC, CTCA, carotid ultrasound reports)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imaging-reports',
  'imaging-reports',
  false,
  15728640,  -- 15 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/dicom']
);

-- Generated PDF reports for download
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-reports',
  'generated-reports',
  false,
  5242880,   -- 5 MB
  ARRAY['application/pdf']
);

-- ---------------------------------------------------------------------------
-- Storage policies: lab-reports
-- ---------------------------------------------------------------------------

-- Users can upload to their own folder: lab-reports/{user_id}/*
CREATE POLICY lab_reports_upload ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'lab-reports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own files
CREATE POLICY lab_reports_read ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'lab-reports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own files
CREATE POLICY lab_reports_delete ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'lab-reports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Storage policies: imaging-reports
-- ---------------------------------------------------------------------------

CREATE POLICY imaging_reports_upload ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'imaging-reports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY imaging_reports_read ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'imaging-reports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY imaging_reports_delete ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'imaging-reports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Storage policies: generated-reports
-- ---------------------------------------------------------------------------

-- Only system (service role) inserts generated reports; users can read their own
CREATE POLICY generated_reports_read ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'generated-reports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can download (read) their own generated reports
-- Insert is handled by the server with service role key
