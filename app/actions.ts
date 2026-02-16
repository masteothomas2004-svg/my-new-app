'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { YoutubeTranscript } from 'youtube-transcript'
import { GoogleGenerativeAI } from '@google/generative-ai'
import pool from '@/lib/db'

// --- 1. AUTHENTICATION (Login & Signup) ---

export type ActionState = {
    message: string;
}

import { encrypt } from '@/lib/auth' // Add this import

// ... imports ...

export async function signup(prevState: ActionState, formData: FormData): Promise<ActionState> {
    // Simulate user creation
    const email = formData.get('email') as string

    // Create a session cookie
    const session = await encrypt({ email, role: 'user' }) // Encrypt the session
    const cookieStore = await cookies()
    cookieStore.set('session', session, {
        httpOnly: true,
        path: '/',
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    })

    redirect('/dashboard')
}

export async function login(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const email = formData.get('email') as string

    // Simple check (accepts any login for this demo)
    const session = await encrypt({ email, role: 'user' }) // Encrypt the session
    const cookieStore = await cookies()
    cookieStore.set('session', session, {
        httpOnly: true,
        path: '/',
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    })

    redirect('/dashboard')
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/')
}

// --- 2. AI STUDY TOOL (YouTube to Notes) ---

export async function generateStudyNotes(formData: FormData) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

    try {
        const videoUrl = formData.get('videoUrl') as string

        // Extract Video ID
        const videoIdMatch = videoUrl?.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)
        const videoId = videoIdMatch ? videoIdMatch[1] : null

        if (!videoId) return { error: "Invalid YouTube URL" }

        let sourceContent = "";
        let contextType = "";

        try {
            // Attempt 1: Fetch Transcript
            const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId)
            sourceContent = transcriptItems.map(item => item.text).join(' ')
            contextType = "TRANSCRIPT";
        } catch (e) {
            // Attempt 2: Fallback to Metadata (Title & Description)
            console.log("Transcript failed, falling back to metadata...");
            const response = await fetch(videoUrl);
            const html = await response.text();

            const titleMatch = html.match(/<title>(.*?)<\/title>/);
            const title = titleMatch ? titleMatch[1].replace(" - YouTube", "") : "Unknown Title";

            const descMatch = html.match(/<meta name="description" content="(.*?)">/);
            const description = descMatch ? descMatch[1] : "No description available.";

            sourceContent = `Title: ${title}\n\nDescription: ${description}`;
            contextType = "METADATA_ONLY";
        }

        // Generate Notes with Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const prompt = `
      You are an expert tutor. Create clear, formatted study notes from this video content.
      
      IMPORTANT: If the source is "METADATA_ONLY", the transcript was unavailable. 
      In that case, generate the best possible notes from the description, but add a disclaimer at the top saying:
      "> **Note:** Detailed transcript was unavailable. These notes are based on the video summary."

      Structure:
      1. 🎯 **Executive Summary**: 2 sentences max.
      2. 🔑 **Key Concepts**: Definitions of core terms.
      3. 📝 **Detailed Notes**: Use bullet points and headers.
      4. 🧠 **Quiz**: 3 short questions to test understanding.

      Formatting: Use Markdown. Ignore filler words.
      SOURCE (${contextType}): ${sourceContent.substring(0, 50000)}
    `

        const result = await model.generateContent(prompt)
        const response = await result.response

        return { success: response.text() }

    } catch (error) {
        console.error("AI Tool Error:", error)
        return { error: "Could not generate notes. Video might constitute of music or check the URL." }
    }
}

// --- 3. ADMIN ACTIONS ---

export async function approveUser(formData: FormData) {
    const userId = formData.get('userId') as string

    if (!userId) return

    try {
        await pool.query('UPDATE users SET is_approved = true WHERE id = $1', [userId])
        revalidatePath('/admin')
    } catch (error) {
        console.error('Failed to approve user:', error)
    }
}