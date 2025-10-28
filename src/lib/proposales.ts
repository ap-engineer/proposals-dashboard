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
    // GET /v3/proposal-search?limit=25 - returns { data: [...] }
    // Default limit is 1, max is 25
    return fetchProposales<ProposalsSearchResponse>("/proposal-search?limit=25");
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

export async function createContent(data: {
    company_id: number;
    language: string;
    title: string;
    description?: string;
    images?: Array<{
        uuid?: string;
        url?: string;
        filename?: string;
        mime_type?: string;
        size?: number;
        height?: number;
        width?: number;
    }>;
}) {
    // POST /v3/content - returns { data: { product_id, variation_id, message } }
    return fetchProposales<{ data: { product_id: number; variation_id: number; message: string } }>("/content", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateContent(data: {
    product_id: number;
    variation_id: number;
    language: string;
    title: string;
    description?: string;
    images?: Array<{
        uuid?: string;
        url?: string;
        filename?: string;
        mime_type?: string;
        size?: number;
        height?: number;
        width?: number;
    }>;
}) {
    // PUT /v3/content - returns { data: { product_id, variation_id, message } }
    return fetchProposales<{ data: { product_id: number; variation_id: number; message: string } }>("/content", {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function createProposal(data: {
    company_id: number;
    title_md: string;
    description_md?: string;
    language?: string;
    contact_email?: string;
    recipient?: {
        first_name?: string;
        last_name?: string;
        email?: string;
        company_name?: string;
    };
    blocks?: any[];
    data?: Record<string, any>;
}) {
    // POST /v3/proposals - returns { proposal: { uuid, url } }
    const payload: any = {
        company_id: data.company_id,
        title_md: data.title_md,
        language: data.language || "en", // Required field, default to English
    }
    
    if (data.description_md) payload.description_md = data.description_md
    if (data.contact_email) payload.contact_email = data.contact_email
    if (data.recipient) payload.recipient = data.recipient
    if (data.blocks) payload.blocks = data.blocks
    if (data.data) payload.data = data.data
    
    return fetchProposales<{ proposal: { uuid: string; url: string } }>("/proposals", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
