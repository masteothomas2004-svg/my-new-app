"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DocumentUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/documents/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                setFile(null);
                router.refresh();
            } else {
                console.error("Upload failed");
            }
        } catch (error) {
            console.error("Error uploading:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4 border rounded shadow bg-white dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-4">Upload Document</h2>
            <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="mb-4 block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100
        "
            />
            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
                {uploading ? "Uploading..." : "Upload"}
            </button>
        </div>
    );
}
