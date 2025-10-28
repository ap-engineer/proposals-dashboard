"use client";
import useSWR from "swr";
import { swrFetcher } from "@/lib/swrFetcher";
import type { ProposalsSearchResponse, Proposal } from "@/app/types/proposales";
import ProposalCard from "./ProposalCard";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";

export default function ProposalList({ url = "/api/proposals" }: { url?: string }) {
    const { data, error, isLoading } = useSWR<ProposalsSearchResponse>(url, swrFetcher);

    if (isLoading) return <LoadingState label="Loading proposals..." />;
    if (error) return <ErrorState label="Failed to load proposals." />;

    // API returns { data: { ... } } structure
    const proposalData = data?.data;
    const proposals = proposalData ? (Array.isArray(proposalData) ? proposalData : [proposalData]) : [];

    if (!proposals.length) {
        return <p style={{ color: "#666", marginTop: 24 }}>No proposals found.</p>;
    }

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {proposals.map((p: Proposal) => (
                <ProposalCard key={p.uuid} proposal={p} />
            ))}
        </div>
    );
}