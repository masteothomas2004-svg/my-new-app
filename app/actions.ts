'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { encrypt, getSession } from '@/lib/auth'

export async function signup(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { message: 'Email and password are required' }
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        await pool.query(
            'INSERT INTO users (email, password, role, is_approved) VALUES ($1, $2, $3, $4)',
            [email, hashedPassword, 'user', false]
        )
        return { message: 'User created. Please wait for admin approval.' }
    } catch (error: any) {
        if (error.code === '23505') {
            return { message: 'Email already exists' }
        }
        console.error('Signup error:', error)
        return { message: 'Failed to create user' }
    }
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        const user = result.rows[0]

        if (!user) {
            return { message: 'Invalid credentials' }
        }

        const passwordsMatch = await bcrypt.compare(password, user.password)
        if (!passwordsMatch) {
            return { message: 'Invalid credentials' }
        }

        if (!user.is_approved) {
            return { message: 'Account not approved yet' }
        }

        const session = await encrypt({ id: user.id, email: user.email, role: user.role })

            // Set cookie
            ; (await cookies()).set('session', session, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60, // 1 hour
                path: '/',
            })

    } catch (error) {
        console.error('Login error:', error)
        return { message: 'Login failed' }
    }

    redirect('/dashboard')
}

export async function logout() {
    ; (await cookies()).delete('session')
    redirect('/')
}

export async function approveUser(formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        // throw new Error('Unauthorized');
        return;
    }

    const userId = formData.get('userId');
    await pool.query('UPDATE users SET is_approved = TRUE WHERE id = $1', [userId]);
    revalidatePath('/admin');
}