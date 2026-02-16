'use server'

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function deleteDocument(formData: FormData) {
    const session = await getSession();
    if (!session) {
        redirect('/');
    }

    const documentId = formData.get('documentId');

    if (!documentId) return;

    try {
        await pool.query('DELETE FROM documents WHERE id = $1', [documentId]);
        revalidatePath('/dashboard/documents');
    } catch (error) {
        console.error('Failed to delete document:', error);
    }
}
