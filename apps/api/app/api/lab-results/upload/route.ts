/**
 * Lab result upload: POST image -> AI extraction.
 * Accepts multipart form data with an image file.
 */

import { NextRequest } from 'next/server';
import { DISCLAIMERS } from '@heart/shared';
import { createUserClient } from '@/lib/supabase-server';
import { extractLabValues } from '@/lib/ai';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const POST = withAuth(async (req: NextRequest, user) => {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const reportDate = formData.get('reportDate') as string | null;

  if (!file) {
    return errorResponse('No file provided', 400);
  }

  if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
    return errorResponse(`Unsupported file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}`, 400);
  }

  if (file.size > MAX_SIZE) {
    return errorResponse('File too large. Maximum size is 10MB.', 400);
  }

  const supabase = await createUserClient();

  // Upload to Supabase storage
  const fileName = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadErr } = await supabase.storage
    .from('lab-reports')
    .upload(fileName, file, { contentType: file.type });

  if (uploadErr) {
    return errorResponse(`File upload failed: ${uploadErr.message}`, 500);
  }

  const { data: urlData } = supabase.storage
    .from('lab-reports')
    .getPublicUrl(fileName);

  // Convert file to base64 for AI extraction
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  let extracted;
  try {
    extracted = await extractLabValues(
      base64,
      file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
    );
  } catch (err) {
    // Store the record even if extraction fails
    const { data: record } = await supabase
      .from('lab_results')
      .insert({
        user_id: user.id,
        report_date: reportDate ?? new Date().toISOString().split('T')[0],
        uploaded_file_url: urlData.publicUrl,
        extraction_status: 'failed',
        raw_ai_extraction: null,
      })
      .select()
      .single();

    return jsonResponse(
      { record, extractionError: err instanceof Error ? err.message : 'Extraction failed' },
      201,
      DISCLAIMERS.aiExtraction,
    );
  }

  // Build lab result record from extracted values (snake_case)
  const labRecord: Record<string, unknown> = {
    user_id: user.id,
    report_date: reportDate ?? new Date().toISOString().split('T')[0],
    uploaded_file_url: urlData.publicUrl,
    extraction_status: 'extracted',
    raw_ai_extraction: {
      model: 'claude-sonnet-4-20250514',
      extractedAt: new Date().toISOString(),
      confidence: Object.values(extracted.confidence).reduce((a, b) => a + b, 0) /
        Math.max(Object.values(extracted.confidence).length, 1),
      rawFields: extracted.values,
    },
  };

  for (const [key, value] of Object.entries(extracted.values)) {
    if (value !== null) {
      const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
      labRecord[snakeKey] = value;
    }
  }

  const { data: record, error: insertErr } = await supabase
    .from('lab_results')
    .insert(labRecord)
    .select()
    .single();

  if (insertErr) {
    return errorResponse(insertErr.message, 500);
  }

  return jsonResponse(
    {
      record,
      extractedValues: extracted.values,
      confidence: extracted.confidence,
      needsConfirmation: true,
    },
    201,
    DISCLAIMERS.aiExtraction,
  );
});
