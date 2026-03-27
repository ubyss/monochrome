export type UserCloudPayload = {
    library: Record<string, unknown>;
    history: unknown[];
    user_playlists: Record<string, unknown>;
    user_folders: Record<string, unknown>;
    updatedAt: number;
};

const memory = new Map<string, string>();

function key(userId: string) {
    return `user:${userId}:data`;
}

async function getKv() {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        return null;
    }
    const { kv } = await import('@vercel/kv');
    return kv;
}

export async function getUserData(userId: string): Promise<UserCloudPayload | null> {
    const k = key(userId);
    const kv = await getKv();

    if (kv) {
        const raw = await kv.get<string>(k);
        if (!raw) return null;
        return JSON.parse(raw) as UserCloudPayload;
    }

    const raw = memory.get(k);
    if (!raw) return null;
    return JSON.parse(raw) as UserCloudPayload;
}

export async function setUserData(userId: string, data: UserCloudPayload): Promise<void> {
    const k = key(userId);
    const str = JSON.stringify(data);
    const kv = await getKv();

    if (kv) {
        await kv.set(k, str);
        return;
    }

    memory.set(k, str);
}

export function isKvConfigured(): boolean {
    return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}
