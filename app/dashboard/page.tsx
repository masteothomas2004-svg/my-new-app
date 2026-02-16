import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { logout } from '../actions'

export default async function Dashboard() {
    const session = await getSession()
    if (!session) redirect('/')

    if (session.role === 'admin') {
        redirect('/admin')
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome User</h1>
                    <form action={logout}>
                        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Logout</button>
                    </form>
                </div>
                <p className="text-gray-600 mb-6">You are logged in as {session.email}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a href="/dashboard/study" className="block p-6 bg-blue-50 border border-blue-200 rounded-xl hover:shadow-lg transition group">
                        <h2 className="text-xl font-bold text-blue-700 mb-2 group-hover:text-blue-600 flex items-center gap-2">
                            <span>📚</span> AI Study Notes
                        </h2>
                        <p className="text-blue-600/80">
                            Summarize YouTube videos and generate study guides instantly.
                        </p>
                    </a>

                    <a href="/dashboard/documents" className="block p-6 bg-purple-50 border border-purple-200 rounded-xl hover:shadow-lg transition group">
                        <h2 className="text-xl font-bold text-purple-700 mb-2 group-hover:text-purple-600 flex items-center gap-2">
                            <span>📄</span> Document Q&A
                        </h2>
                        <p className="text-purple-600/80">
                            Upload PDFs and ask questions to get instant answers from AI.
                        </p>
                    </a>
                </div>
            </div>
        </div>
    )
}
