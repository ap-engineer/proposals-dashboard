export default function LoadingState({ label = "Loading..." }: { label?: string }) {
    return (
        <div style={{
            border: "1px dashed #ddd",
            padding: 16,
            borderRadius: 8,
            color: "#666"
        }}>
            {label}
        </div>
    );
}