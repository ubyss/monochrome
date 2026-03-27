import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtAndGetAccount } from '@/lib/appwrite';
import { getUserData, setUserData, isKvConfigured, type UserCloudPayload } from '@/lib/store';

function getBearer(req: NextRequest): string | null {
    const h = req.headers.get('authorization');
    if (!h?.startsWith('Bearer ')) return null;
    return h.slice(7).trim() || null;
}

export async function GET(req: NextRequest) {
    const jwt = getBearer(req);
    const endpoint = process.env.APPWRITE_ENDPOINT;
    const projectId = process.env.APPWRITE_PROJECT_ID;

    if (!jwt || !endpoint || !projectId) {
        return NextResponse.json({ error: 'Missing Authorization Bearer JWT or server env' }, { status: 401 });
    }

    const account = await verifyJwtAndGetAccount(jwt, endpoint, projectId);
    if (!account?.$id) {
        return NextResponse.json({ error: 'Invalid or expired JWT' }, { status: 401 });
    }

    const data = await getUserData(account.$id);
    if (!data) {
        return NextResponse.json({
            library: {},
            history: [],
            user_playlists: {},
            user_folders: {},
        });
    }

    const { updatedAt: _u, ...rest } = data;
    return NextResponse.json(rest);
}

export async function POST(req: NextRequest) {
    const jwt = getBearer(req);
    const endpoint = process.env.APPWRITE_ENDPOINT;
    const projectId = process.env.APPWRITE_PROJECT_ID;

    if (!jwt || !endpoint || !projectId) {
        return NextResponse.json({ error: 'Missing Authorization Bearer JWT or server env' }, { status: 401 });
    }

    const account = await verifyJwtAndGetAccount(jwt, endpoint, projectId);
    if (!account?.$id) {
        return NextResponse.json({ error: 'Invalid or expired JWT' }, { status: 401 });
    }

    let body: Partial<UserCloudPayload>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const payload: UserCloudPayload = {
        library: (body.library as Record<string, unknown>) || {},
        history: Array.isArray(body.history) ? body.history : [],
        user_playlists: (body.user_playlists as Record<string, unknown>) || {},
        user_folders: (body.user_folders as Record<string, unknown>) || {},
        updatedAt: Date.now(),
    };

    await setUserData(account.$id, payload);

    return NextResponse.json({ ok: true, storage: isKvConfigured() ? 'kv' : 'memory' });
}
