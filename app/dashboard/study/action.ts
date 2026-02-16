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

        let contextType = "TRANSCRIPT";
        let sourceContent = "";

        // 2. Fetch Transcript or Fallback
        try {
            console.log("Fetching transcript for:", videoId)
            const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId)

            if (!transcriptItems) throw new Error("Transcript items is null or undefined");

            console.log("Transcript found, items count:", transcriptItems.length)
            sourceContent = transcriptItems.map(item => item.text).join(' ');

        } catch (transcriptError) {
            console.log("Transcript failed, falling back to metadata...");
            // Fallback to Metadata (Title & Description)
            try {
                const response = await fetch(videoUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                const html = await response.text();

                const titleMatch = html.match(/<title>(.*?)<\/title>/);
                const title = titleMatch ? titleMatch[1].replace(" - YouTube", "") : "Unknown Title";

                const descMatch = html.match(/<meta name="description" content="(.*?)">/);
                const description = descMatch ? descMatch[1] : "No description available.";

                sourceContent = `Title: ${title}\n\nDescription: ${description}`;
                contextType = "METADATA_ONLY";
            } catch (optError) {
                throw new Error("Failed to fetch video metadata as fallback.");
            }
        }

        // 3. Call Gemini AI
        console.log("Calling Gemini API...")
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

      Formatting:
      - Use Markdown (bold, lists, headers).
      - Ignore filler words like "um", "like", "subscribe".

      SOURCE (${contextType}):
      ${sourceContent.substring(0, 50000)} 
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

        // Return a cleaner error message
        return { error: `Failed to process video: ${error.message || "Unknown error"}` }
    }
}