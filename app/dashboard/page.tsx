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
                <h1 className="text-3xl font-bold mb-4 text-gray-800">Welcome User</h1>
                <p className="text-gray-600 mb-6">You are logged in as {session.email}</p>
                <form action={logout}>
                    <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Logout</button>
                </form>
            </div>
        </div>
    )
}
