import { NextResponse } from 'next/server';

/** Health probe for the platform. No auth, no dependencies, no state. */
export function GET(): NextResponse {
  return NextResponse.json({ status: 'ok', service: 'sentinel' });
}
