'use client'

import { useActionState } from 'react'
import { login, signup } from './actions'
import { useState } from 'react'

const initialState = {
  message: '',
}

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [state, formAction, isPending] = useActionState(isLogin ? login : signup, initialState)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="z-10 w-full max-w-md items-center justify-between font-mono text-sm p-8 bg-gray-800 rounded shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-8">{isLogin ? 'Login' : 'Sign Up'}</h1>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Email</label>
            <input name="email" type="email" placeholder="Email" required className="w-full p-2 border rounded text-black" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Password</label>
            <input name="password" type="password" placeholder="Password" required className="w-full p-2 border rounded text-black" />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 font-bold mt-4 disabled:opacity-50"
          >
            {isPending ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
          {state?.message && <p className="text-red-400 text-center mt-2 font-bold">{state.message}</p>}
        </form>

        <p className="mt-6 text-center cursor-pointer text-blue-400 hover:text-blue-300 underline" onClick={() => { setIsLogin(!isLogin); }}>
          {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
        </p>
      </div>
    </main>
  )
}
