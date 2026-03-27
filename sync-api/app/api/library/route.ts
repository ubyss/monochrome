import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtAndGetAccount } from '@/lib/appwrite';
import { getUserData, setUserData, isKvConfigured, type UserCloudPayload } from '@/lib/store';

const ALLOWED_ORIGINS = new Set(['http://localhost:5173']);

function getCorsHeaders(req: NextRequest): Record<string, string> {
    const origin = req.headers.get('origin');
    if (!origin || !ALLOWED_ORIGINS.has(origin)) {
        return {};
    }
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        Vary: 'Origin',
    };
}

function jsonWithCors(req: NextRequest, body: unknown, init?: { status?: number }) {
    return NextResponse.json(body, {
        status: init?.status,
        headers: getCorsHeaders(req),
    });
}

function getBearer(req: NextRequest): string | null {
    const h = req.headers.get('authorization');
    if (!h?.startsWith('Bearer ')) return null;
    return h.slice(7).trim() || null;
}

export async function OPTIONS(req: NextRequest) {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(req) });
}

export async function GET(req: NextRequest) {
    const jwt = getBearer(req);
    const endpoint = process.env.APPWRITE_ENDPOINT;
    const projectId = process.env.APPWRITE_PROJECT_ID;

    if (!jwt || !endpoint || !projectId) {
        return jsonWithCors(req, { error: 'Missing Authorization Bearer JWT or server env' }, { status: 401 });
    }

    const account = await verifyJwtAndGetAccount(jwt, endpoint, projectId);
    if (!account?.$id) {
        return jsonWithCors(req, { error: 'Invalid or expired JWT' }, { status: 401 });
    }

    const data = await getUserData(account.$id);
    if (!data) {
        return jsonWithCors(req, {
            library: {},
            history: [],
            user_playlists: {},
            user_folders: {},
        });
    }

    const { updatedAt: _u, ...rest } = data;
    return jsonWithCors(req, rest);
}

export async function POST(req: NextRequest) {
    const jwt = getBearer(req);
    const endpoint = process.env.APPWRITE_ENDPOINT;
    const projectId = process.env.APPWRITE_PROJECT_ID;

    if (!jwt || !endpoint || !projectId) {
        return jsonWithCors(req, { error: 'Missing Authorization Bearer JWT or server env' }, { status: 401 });
    }

    const account = await verifyJwtAndGetAccount(jwt, endpoint, projectId);
    if (!account?.$id) {
        return jsonWithCors(req, { error: 'Invalid or expired JWT' }, { status: 401 });
    }

    let body: Partial<UserCloudPayload>;
    try {
        body = await req.json();
    } catch {
        return jsonWithCors(req, { error: 'Invalid JSON body' }, { status: 400 });
    }

    const payload: UserCloudPayload = {
        library: (body.library as Record<string, unknown>) || {},
        history: Array.isArray(body.history) ? body.history : [],
        user_playlists: (body.user_playlists as Record<string, unknown>) || {},
        user_folders: (body.user_folders as Record<string, unknown>) || {},
        updatedAt: Date.now(),
    };

    await setUserData(account.$id, payload);

    return jsonWithCors(req, { ok: true, storage: isKvConfigured() ? 'kv' : 'memory' });
}
