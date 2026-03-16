/**
 * Supabase OAuth callback handler.
 * Exchanges the auth code for a session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUserClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?message=missing_code`);
  }

  const supabase = await createUserClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
