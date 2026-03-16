/**
 * PDF report generation: POST.
 */

import { NextRequest } from 'next/server';
import { DISCLAIMERS } from '@heart/shared';
import { generateHealthReport } from '@/lib/pdf-generator';
import { createUserClient } from '@/lib/supabase-server';
import { withAuth, errorResponse } from '@/lib/route-helpers';
import { NextResponse } from 'next/server';

export const POST = withAuth(async (_req: NextRequest, user) => {
  const supabase = await createUserClient();

  // Fetch all required data
  const [profileRes, scoresRes, labsRes, planRes] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('risk_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('calculated_at', { ascending: false })
      .limit(10),
    supabase
      .from('lab_results')
      .select('*')
      .eq('user_id', user.id)
      .eq('extraction_status', 'confirmed')
      .order('report_date', { ascending: false })
      .limit(5),
    supabase
      .from('lifestyle_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .single(),
  ]);

  if (!profileRes.data) {
    return errorResponse('Profile not found', 404);
  }

  try {
    const pdfBuffer = await generateHealthReport({
      profile: profileRes.data,
      scores: scoresRes.data ?? [],
      labs: labsRes.data ?? [],
      lifestyle: planRes.data ?? {},
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="heart-prevention-report-${new Date().toISOString().split('T')[0]}.pdf"`,
        'X-Disclaimer': DISCLAIMERS.general,
      },
    });
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : 'PDF generation failed',
      500,
    );
  }
});
