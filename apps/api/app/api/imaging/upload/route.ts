/**
 * Imaging report upload: POST CTCA/CAC report image -> AI extraction.
 */

import { NextRequest } from 'next/server';
import { DISCLAIMERS } from '@heart/shared';
import { createUserClient } from '@/lib/supabase-server';
import { extractImagingReport } from '@/lib/ai';
import { withAuth, jsonResponse, errorResponse } from '@/lib/route-helpers';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
const MAX_SIZE = 10 * 1024 * 1024;

export const POST = withAuth(async (req: NextRequest, user) => {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const imagingType = formData.get('imagingType') as string | null;
  const performedAt = formData.get('performedAt') as string | null;

  if (!file) {
    return errorResponse('No file provided', 400);
  }

  if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
    return errorResponse(`Unsupported file type: ${file.type}`, 400);
  }

  if (file.size > MAX_SIZE) {
    return errorResponse('File too large. Maximum size is 10MB.', 400);
  }

  if (!imagingType || !['cac_score', 'ctca', 'carotid_ultrasound'].includes(imagingType)) {
    return errorResponse('Invalid or missing imagingType', 400);
  }

  const supabase = await createUserClient();

  // Upload to storage
  const fileName = `${user.id}/imaging/${Date.now()}-${file.name}`;
  const { error: uploadErr } = await supabase.storage
    .from('imaging-reports')
    .upload(fileName, file, { contentType: file.type });

  if (uploadErr) {
    return errorResponse(`Upload failed: ${uploadErr.message}`, 500);
  }

  // Extract data with AI
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  let extracted;
  try {
    extracted = await extractImagingReport(
      base64,
      file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
    );
  } catch (err) {
    return errorResponse(
      `AI extraction failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      500,
    );
  }

  // Build imaging record
  const record: Record<string, unknown> = {
    user_id: user.id,
    imaging_type: imagingType,
    performed_at: performedAt ?? new Date().toISOString(),
  };

  if (extracted.agatstonTotal != null) {
    record.agatston_scores = {
      lm: extracted.agatstonLm,
      lad: extracted.agatstonLad,
      lcx: extracted.agatstonLcx,
      rca: extracted.agatstonRca,
      total: extracted.agatstonTotal,
    };
  }

  if (extracted.cadRadsScore) {
    record.cad_rads_score = extracted.cadRadsScore;
  }

  if (extracted.highRiskPlaque) {
    record.high_risk_plaque = extracted.highRiskPlaque;
  }

  if (extracted.lvef != null) {
    record.lvef = extracted.lvef;
  }

  const { data, error: insertErr } = await supabase
    .from('imaging_results')
    .insert(record)
    .select()
    .single();

  if (insertErr) {
    return errorResponse(insertErr.message, 500);
  }

  return jsonResponse(
    { record: data, extracted, needsConfirmation: true },
    201,
    DISCLAIMERS.imaging,
  );
});
