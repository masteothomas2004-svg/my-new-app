// app/admin/page.tsx

import pool from '@/lib/db';
import { approveUser } from '../actions';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
    // --- SECURITY CHECK START ---
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        redirect('/');
    }
    // --- SECURITY CHECK END ---


    // 4. Fetch all users from the database
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    const users = result.rows;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-10">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="py-3 px-6 text-left">ID</th>
                            <th className="py-3 px-6 text-left">Email</th>
                            <th className="py-3 px-6 text-left">Role</th>
                            <th className="py-3 px-6 text-left">Status</th>
                            <th className="py-3 px-6 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750">
                                <td className="py-3 px-6">{user.id}</td>
                                <td className="py-3 px-6">{user.email}</td>
                                <td className="py-3 px-6">{user.role}</td>

                                {/* Status Column: Green if active, Yellow if pending */}
                                <td className="py-3 px-6">
                                    {user.is_approved ? (
                                        <span className="bg-green-900 text-green-300 py-1 px-3 rounded-full text-xs">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="bg-yellow-900 text-yellow-300 py-1 px-3 rounded-full text-xs">
                                            Pending
                                        </span>
                                    )}
                                </td>

                                {/* Action Column: The "Approve" Button */}
                                <td className="py-3 px-6">
                                    {!user.is_approved && (
                                        <form action={approveUser}>
                                            {/* Hidden input to pass the User ID to our action */}
                                            <input type="hidden" name="userId" value={user.id} />
                                            <button
                                                type="submit"
                                                className="bg-blue-600 hover:bg-blue-500 text-white text-sm py-1 px-4 rounded transition"
                                            >
                                                Approve
                                            </button>
                                        </form>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}