export async function swrFetcher<T>(url: string): Promise<T> {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Fetch failed ${res.status}: ${txt || res.statusText}`);
    }
    return res.json() as Promise<T>;
}