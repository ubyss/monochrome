import { createAppwriteJwt } from '../lib/appwrite.js';
import { getSyncApiBaseUrl } from '../lib/sync-api-config.js';

export async function fetchLibraryFromSyncApi() {
    const base = getSyncApiBaseUrl();
    if (!base) return null;

    let jwt;
    try {
        jwt = await createAppwriteJwt();
    } catch {
        return null;
    }
    if (!jwt) return null;

    const res = await fetch(`${base}/api/library`, {
        headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) {
        console.warn('[Sync API] GET /api/library failed', res.status);
        return null;
    }

    let json;
    try {
        json = await res.json();
    } catch {
        return null;
    }
    if (!json || json.error) return null;

    return {
        library: json.library || {},
        history: Array.isArray(json.history) ? json.history : [],
        userPlaylists: json.user_playlists || {},
        userFolders: json.user_folders || {},
    };
}

async function postLibraryPayload(base, jwt, body) {
    const res = await fetch(`${base}/api/library`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        console.warn('[Sync API] POST /api/library failed', res.status);
    }
}

export async function mirrorToSyncApi(getUserData) {
    const base = getSyncApiBaseUrl();
    if (!base) return;

    let jwt;
    try {
        jwt = await createAppwriteJwt();
    } catch {
        return;
    }
    if (!jwt) return;

    const data = await getUserData();
    if (!data) return;

    await postLibraryPayload(base, jwt, {
        library: data.library || {},
        history: data.history || [],
        user_playlists: data.userPlaylists || {},
        user_folders: data.userFolders || {},
    });
}

export async function mirrorEmptyToSyncApi() {
    const base = getSyncApiBaseUrl();
    if (!base) return;

    let jwt;
    try {
        jwt = await createAppwriteJwt();
    } catch {
        return;
    }
    if (!jwt) return;

    await postLibraryPayload(base, jwt, {
        library: {},
        history: [],
        user_playlists: {},
        user_folders: {},
    });
}
