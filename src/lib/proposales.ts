import type { ProposalsSearchResponse, ProposalGetResponse } from "@/app/types/proposales";

export const BASE_URL = "https://api.proposales.com/v3";

async function fetchProposales<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const apiKey = process.env.PROPOSALES_API_KEY;
    
    if (!apiKey) {
        throw new Error("PROPOSALES_API_KEY is not set");
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            ...options?.headers,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("Proposales API error:", res.status, text);
        throw new Error(`API Error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
}

export async function listProposals() {
    // GET /v3/proposal-search - returns { data: { ... } }
    return fetchProposales<ProposalsSearchResponse>("/proposal-search");
}

export async function getProposal(id: string) {
    // GET /v3/proposals/{uuid} - returns { data: { ... } }
    return fetchProposales<ProposalGetResponse>(`/proposals/${id}`);
}

export async function listCompanies() {
    // GET /v3/companies - returns { data: [...] }
    return fetchProposales<{ data: any[] }>("/companies");
}

export async function listContent() {
    // GET /v3/content - returns { data: [...] }
    return fetchProposales<{ data: any[] }>("/content");
}

export async function createProposal(data: {
    company_id: number;
    title_md: string;
    description_md?: string;
    language?: string;
    contact_email?: string;
    recipient?: {
        name?: string;
        email?: string;
        company_name?: string;
    };
    blocks?: any[];
    data?: Record<string, any>;
}) {
    // POST /v3/proposals - returns { proposal: { uuid, url } }
    return fetchProposales<{ proposal: { uuid: string; url: string } }>("/proposals", {
        method: "POST",
        body: JSON.stringify(data),
    });
}
