/**
 * Default SWR fetcher function
 * Used across all pages for consistent data fetching
 */
export async function fetcher<T = any>(url: string): Promise<T> {
    const res = await fetch(url, {cache: "no-store"});
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Fetch failed ${res.status}: ${txt || res.statusText}`);
    }
    return res.json() as Promise<T>;
}

/**
 * Default SWR configuration
 * Consistent settings across all useSWR calls
 */
export const swrConfig = {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    shouldRetryOnError: false,
    dedupingInterval: 2000,
} as const