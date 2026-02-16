// app/dashboard/study/page.tsx
'use client'

import { useState } from 'react';
import { generateStudyNotes } from './action';
import ReactMarkdown from 'react-markdown';

export default function StudyNotesPage() {
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    setNotes("");
    setCopied(false);

    // 1. Extract the string from the form data
    const videoUrl = formData.get('videoUrl') as string;

    // 2. Call the server action with the string
    const result = await generateStudyNotes(videoUrl);

    // 3. Handle the response (checking for result.success which contains the text)
    if (result.success) {
      setNotes(result.success);
    } else {
      setError(result.error || "Something went wrong");
    }
    setLoading(false);
  }

  const handleCopy = () => {
    if (!notes) return;
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          AI Video Summarizer 📺
        </h1>

        {/* Search Form */}
        <form action={handleSubmit} className="flex gap-4 mb-10">
          <input
            name="videoUrl"
            placeholder="Paste YouTube Link (e.g. https://youtu.be/...)"
            className="flex-1 p-4 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/20 active:scale-95"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </span>
            ) : "Generate Notes"}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl mb-8 text-red-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        )}

        {/* Results Area */}
        {notes && (
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-700/50 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
              <h2 className="text-2xl font-bold text-gray-100">Study Notes</h2>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${copied
                  ? "bg-green-600/20 text-green-400 border border-green-600/30"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
                  }`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                    Copy Markdown
                  </>
                )}
              </button>
            </div>
            <div className="prose prose-invert prose-blue max-w-none 
              prose-headings:text-gray-100 prose-headings:font-bold
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-strong:text-white prose-strong:font-semibold
              prose-ul:my-6 prose-li:my-2
              prose-code:bg-gray-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-blue-200 prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700
            ">
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}