export type AppwriteAccount = {
    $id: string;
    email?: string;
    name?: string;
};

export async function verifyJwtAndGetAccount(
    jwt: string,
    endpoint: string,
    projectId: string
): Promise<AppwriteAccount | null> {
    const url = `${endpoint.replace(/\/$/, '')}/account`;
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'X-Appwrite-Project': projectId,
            'X-Appwrite-JWT': jwt,
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        return null;
    }

    return res.json() as Promise<AppwriteAccount>;
}
