"use client";
import { useState, useEffect } from "react";

type Props = {
    placeholder?: string;
    value?: string;
    onChange: (v: string) => void;
    onClear?: () => void;
};

export default function SearchBar({ placeholder, value = "", onChange, onClear }: Props) {
    const [text, setText] = useState(value);

    useEffect(() => {
        setText(value);
    }, [value]);

    return (
        <div style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "6px 10px",
            background: "#fff"
        }}>
            <input
                aria-label="Search"
                placeholder={placeholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") onChange(text.trim());
                }}
                style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: 14
                }}
            />
            {text ? (
                <button
                    type="button"
                    onClick={() => {
                        setText("");
                        onChange("");
                        onClear?.();
                    }}
                    style={{
                        fontSize: 12,
                        padding: "4px 8px",
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        background: "#fafafa"
                    }}
                >
                    Clear
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => onChange(text.trim())}
                    style={{
                        fontSize: 12,
                        padding: "4px 8px",
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        background: "#fafafa"
                    }}
                >
                    Search
                </button>
            )}
        </div>
    );
}