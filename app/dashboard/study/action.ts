'use server'

import { YoutubeTranscript } from 'youtube-transcript'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export async function generateStudyNotes(videoUrl: string) {
    try {
        console.log("Processing URL:", videoUrl)

        // 1. Extract Video ID from URL
        const videoIdMatch = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)
        const videoId = videoIdMatch ? videoIdMatch[1] : null

        console.log("Extracted Video ID:", videoId)

        if (!videoId) return { error: "Invalid YouTube URL" }

        // 2. Fetch Transcript
        console.log("Fetching transcript for:", videoId)
        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId)

        if (!transcriptItems) {
            console.error("Transcript items is null or undefined")
            throw new Error("Transcript not found")
        }
        console.log("Transcript found, items count:", transcriptItems.length)

        const transcriptText = transcriptItems.map(item => item.text).join(' ')

        // 3. Call Gemini AI
        console.log("Calling Gemini API...")
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

        const prompt = `
      You are an expert tutor. Create clear, formatted study notes from this video transcript.
      
      Structure:
      1. 🎯 **Executive Summary**: 2 sentences max.
      2. 🔑 **Key Concepts**: Definitions of core terms.
      3. 📝 **Detailed Notes**: Use bullet points and headers.
      4. 🧠 **Quiz**: 3 short questions to test understanding.

      Formatting:
      - Use Markdown (bold, lists, headers).
      - Ignore filler words like "um", "like", "subscribe".

      TRANSCRIPT:
      ${transcriptText.substring(0, 50000)} 
    `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        console.log("Gemini response received")

        return { success: text }

    } catch (error: any) {
        console.error("Detailed Error in generateStudyNotes:", error)

        if (error.message && error.message.includes("Sign in to confirm you're not a bot")) {
            return { error: "YouTube is blocking the request (Bot detection). Try a different video or try again later." }
        }

        return { error: `Failed to process video: ${error.message || "Unknown error"}` }
    }
}