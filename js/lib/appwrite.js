import { Client, Account, Databases } from 'appwrite';

const DEFAULT_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const DEFAULT_PROJECT_ID = '69c700650032a44907ed';

const getEndpoint = () => {
    const local = localStorage.getItem('monochrome-appwrite-endpoint');
    if (local) return local;

    if (window.__APPWRITE_ENDPOINT__) return window.__APPWRITE_ENDPOINT__;

    const hostname = window.location.hostname;
    if (hostname.endsWith('monochrome.tf') || hostname === 'monochrome.tf') {
        return 'https://auth.monochrome.tf/v1';
    }
    return DEFAULT_ENDPOINT;
};

const getProject = () => {
    const local = localStorage.getItem('monochrome-appwrite-project');
    if (local) return local;

    if (window.__APPWRITE_PROJECT_ID__) return window.__APPWRITE_PROJECT_ID__;

    return DEFAULT_PROJECT_ID;
};

const client = new Client().setEndpoint(getEndpoint()).setProject(getProject());

const account = new Account(client);
const databases = new Databases(client);

export async function pingAppwriteBackend() {
    return client.ping();
}

export { client, account, databases };
