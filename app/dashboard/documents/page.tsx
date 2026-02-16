import pool from "@/lib/db";
import DocumentUpload from "@/components/document-upload";
import ChatInterface from "@/components/chat-interface";
import { deleteDocument } from "./actions";
import { Suspense } from "react";

// Server Component (implicitly) to fetch documents
async function getDocuments() {
    const res = await pool.query("SELECT id, filename, created_at FROM documents ORDER BY created_at DESC");
    return res.rows;
}

export default async function DocumentsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }> // Next.js 15 requires async searchParams
}) {
    const sp = await searchParams;
    const selectedDocId = sp?.docId ? parseInt(sp.docId as string) : null;
    const documents = await getDocuments();
    const selectedDoc = documents.find((d) => d.id === selectedDocId);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Document Q&A</h1>
                <a href="/dashboard" className="text-blue-500 hover:text-blue-700 font-medium flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Dashboard
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <DocumentUpload />

                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                        <h2 className="text-xl font-bold mb-4">Your Documents</h2>
                        <ul className="space-y-2">
                            {documents.map((doc) => (
                                <li key={doc.id} className="border p-2 rounded hover:bg-gray-100 dark:hover:text-black">
                                    <div className="flex justify-between items-center group/item">
                                        <a href={`/dashboard/documents?docId=${doc.id}`} className="block flex-1">
                                            {doc.filename}
                                            <span className="text-xs text-gray-500 block">
                                                {new Date(doc.created_at).toLocaleDateString()}
                                            </span>
                                        </a>
                                        <form action={deleteDocument}>
                                            <input type="hidden" name="documentId" value={doc.id} />
                                            <button type="submit" className="text-red-400 hover:text-red-600 p-2 opacity-0 group-hover/item:opacity-100 transition-opacity" title="Delete">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </form>
                                    </div>
                                </li>
                            ))}
                            {documents.length === 0 && (
                                <p className="text-gray-500">No documents uploaded yet.</p>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="md:col-span-2">
                    {selectedDoc ? (
                        <ChatInterface documentId={selectedDoc.id} filename={selectedDoc.filename} />
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center h-[600px] flex flex-col items-center justify-center text-gray-500">
                            <p>Select a document to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
