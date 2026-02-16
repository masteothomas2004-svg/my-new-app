import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
const PDFParser = require("pdf2json");

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const userId = 1; // Hardcoded generic user for now

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let content = "";

        if (file.type === "application/pdf") {
            const pdfParser = new PDFParser(null, 1);

            content = await new Promise((resolve, reject) => {
                pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
                pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                    resolve(pdfParser.getRawTextContent());
                });
                pdfParser.parseBuffer(buffer);
            });
        } else {
            content = buffer.toString("utf-8");
        }

        const result = await pool.query(
            "INSERT INTO documents (user_id, filename, content) VALUES ($1, $2, $3) RETURNING *",
            [userId, file.name, content]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: `Upload failed: ${error.message || "Unknown error"}` }, { status: 500 });
    }
}
