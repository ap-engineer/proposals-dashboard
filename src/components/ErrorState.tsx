export default function ErrorState({ label = "Something went wrong." }: { label?: string }) {
    return (
        <div style={{
            border: "1px solid #f7d7db",
            background: "#fff5f6",
            padding: 16,
            borderRadius: 8,
            color: "#b00020"
        }}>
            {label}
        </div>
    );
}
