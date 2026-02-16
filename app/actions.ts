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

        // Fetch Transcript
        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId)
        const transcriptText = transcriptItems.map(item => item.text).join(' ')

        // Generate Notes with Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const prompt = `
      You are an expert tutor. Create clear, formatted study notes from this video transcript.
      Structure:
      1. 🎯 **Executive Summary**: 2 sentences max.
      2. 🔑 **Key Concepts**: Definitions of core terms.
      3. 📝 **Detailed Notes**: Use bullet points and headers.
      4. 🧠 **Quiz**: 3 short questions to test understanding.

      Formatting: Use Markdown. Ignore filler words.
      TRANSCRIPT: ${transcriptText.substring(0, 50000)}
    `

        const result = await model.generateContent(prompt)
        const response = await result.response

        return { success: response.text() }

    } catch (error) {
        console.error("AI Tool Error:", error)
        return { error: "Could not generate notes. Video might lack captions." }
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