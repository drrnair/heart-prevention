/**
 * Shared route helpers for consistent auth, response formatting, and error handling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUserClient } from './supabase-server';
import type { User } from '@supabase/supabase-js';

/** Standard JSON response envelope. */
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: string | null;
  readonly disclaimer?: string;
}

/** Create a successful JSON response. */
export function jsonResponse<T>(
  data: T,
  status = 200,
  disclaimer?: string,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      error: null,
      ...(disclaimer ? { disclaimer } : {}),
    },
    { status },
  );
}

/** Create an error JSON response. */
export function errorResponse(
  message: string,
  status = 400,
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    { success: false, data: null, error: message },
    { status },
  );
}

/** Route context with dynamic params (Next.js App Router). */
export type RouteContext<P extends Record<string, string> = Record<string, string>> = {
  params: Promise<P>;
};

/** Handler function type that receives the authenticated user. */
type AuthenticatedHandler<P extends Record<string, string> = Record<string, string>> = (
  req: NextRequest,
  user: User,
  params: P,
) => Promise<NextResponse>;

/**
 * Middleware that extracts the authenticated user from the request.
 * Returns 401 if no valid session exists.
 * Passes through Next.js dynamic route params.
 */
export function withAuth<P extends Record<string, string> = Record<string, string>>(
  handler: AuthenticatedHandler<P>,
) {
  return async (
    req: NextRequest,
    context?: RouteContext<P>,
  ): Promise<NextResponse> => {
    try {
      const supabase = await createUserClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return errorResponse('Authentication required', 401);
      }

      const params = context ? await context.params : ({} as P);
      return handler(req, user, params);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Internal server error';
      return errorResponse(message, 500);
    }
  };
}
