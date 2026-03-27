import { NextResponse } from 'next/server';
import { isKvConfigured } from '@/lib/store';

export async function GET() {
    return NextResponse.json({
        ok: true,
        kv: isKvConfigured() ? 'vercel-kv' : 'memory-dev-only',
    });
}
