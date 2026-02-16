"use client";

import { useState } from "react";

interface ChatInterfaceProps {
    documentId: number;
    filename: string;
}

export default function ChatInterface({ documentId, filename }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/documents/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId, question: userMessage.content }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
            } else {
                setMessages((prev) => [...prev, { role: "system", content: "Error: " + data.error }]);
            }
        } catch (error) {
            setMessages((prev) => [...prev, { role: "system", content: "Error sending message" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] border rounded shadow bg-white dark:bg-gray-800">
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
                <h3 className="font-semibold">Chatting about: {filename}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`p-3 rounded-lg max-w-[80%] ${msg.role === "user"
                                ? "bg-blue-100 text-blue-900 self-end ml-auto"
                                : msg.role === "system"
                                    ? "bg-red-100 text-red-900"
                                    : "bg-gray-100 text-gray-900"
                            }`}
                    >
                        <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.content}
                    </div>
                ))}
                {loading && <div className="text-gray-500 italic">Thinking...</div>}
            </div>

            <div className="p-4 border-t flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask a question..."
                    className="flex-1 p-2 border rounded text-black"
                />
                <button
                    onClick={sendMessage}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
