"use client";
import Link from "next/link";
import type { Proposal } from "@/app/types/proposales";

function StatusBadge({ status }: { status?: string }) {
    if (!status) return null;
    const bg = "#eef2ff";
    const color = "#3730a3";
    return (
        <span style={{
            display: "inline-block",
            fontSize: 12,
            padding: "2px 8px",
            borderRadius: 999,
            background: bg,
            color
        }}>
      {status}
    </span>
    );
}

export default function ProposalCard({ proposal }: { proposal: Proposal }) {
    const created = proposal.created_at
        ? new Date(proposal.created_at * 1000).toLocaleString()
        : "—";

    return (
        <div style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 14,
            background: "#fff"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Link href={`/proposals/${proposal.uuid}`} style={{ fontWeight: 600 }}>
                    {proposal.title || "Untitled proposal"}
                </Link>
                <StatusBadge status={proposal.status} />
            </div>

            <div style={{ color: "#666", fontSize: 13 }}>
                Created: {created}
            </div>

            <div style={{ marginTop: 12 }}>
                <Link
                    href={`/proposals/${proposal.uuid}`}
                    style={{
                        fontSize: 14,
                        padding: "6px 10px",
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        display: "inline-block"
                    }}
                >
                    View details
                </Link>
            </div>
        </div>
    );
}