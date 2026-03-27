export default function Home() {
    return (
        <main>
            <h1>Monochrome sync API</h1>
            <p>
                Deploy on Vercel, set env vars, use <code>GET/POST /api/library</code> with{' '}
                <code>Authorization: Bearer &lt;Appwrite JWT&gt;</code>.
            </p>
            <p>
                <a href="/api/health">/api/health</a>
            </p>
        </main>
    );
}
