import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import groq from "@/lib/groq";

export async function POST(req: NextRequest) {
    try {
        const { documentId, question } = await req.json();

        if (!documentId || !question) {
            return NextResponse.json({ error: "Missing documentId or question" }, { status: 400 });
        }

        const docResult = await pool.query("SELECT content FROM documents WHERE id = $1", [documentId]);

        if (docResult.rows.length === 0) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        const documentContent = docResult.rows[0].content;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a helpful assistant. Answer the user's question based ONLY on the following document content:\n\n${documentContent}\n\nIf the answer is not in the document, say "I cannot find the answer in the document."`,
                },
                {
                    role: "user",
                    content: question,
                },
            ],
            model: "llama-3.3-70b-versatile", // Updated to supported model
        });

        const answer = chatCompletion.choices[0]?.message?.content || "No answer generated.";

        return NextResponse.json({ answer });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Chat error details:", JSON.stringify(error, null, 2));
        return NextResponse.json({ error: `Chat failed: ${errorMessage}` }, { status: 500 });
    }
}
