'use client'

import { useActionState } from 'react'
import { login, signup } from './actions'
import { useState } from 'react'
import Image from 'next/image'

const initialState = {
  message: '',
}

export default function Home() {
  const [isLogin, setIsLogin] = useState(false) // Default to Sign Up as per design
  const [state, formAction, isPending] = useActionState(isLogin ? login : signup, initialState)

  return (
    <main className="flex min-h-screen bg-white text-gray-800 font-sans">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24">
        <div className="mb-8">
          {/* Logo Placeholder */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-full bg-green-900 flex items-center justify-center text-white font-bold text-xl">
              PC
            </div>
          </div>

          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-gray-600 text-sm">
            {isLogin ? 'Please enter your details to login' : 'Kindly fill in your details to be a part of the camp'}
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Your Full name</label>
              <input name="name" type="text" placeholder="Enter name" className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 bg-gray-50 text-gray-900 placeholder-gray-400 transition-all" />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email address</label>
            <input name="email" type="email" placeholder="Enter email" required className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 bg-gray-50 text-gray-900 placeholder-gray-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{isLogin ? 'Password' : 'Create password'}</label>
            <div className="relative">
              <input name="password" type="password" placeholder={isLogin ? "Enter password" : "Create password"} required className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 bg-gray-50 text-gray-900 placeholder-gray-400 transition-all" />
              {/* Eye Icon Placeholder for future toggle functionality */}
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="terms" className="w-4 h-4 text-green-900 border-gray-300 rounded focus:ring-green-900 accent-green-900" />
              <label htmlFor="terms" className="text-sm text-gray-600 font-bold">I agree to terms & conditions</label>
            </div>
          )}


          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-green-900 text-white p-3 rounded-xl hover:bg-green-800 font-bold text-lg mt-2 shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>

          {state?.message && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{state.message}</p>}
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-300 text-sm">Or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="flex flex-col gap-3">
          <button type="button" className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors justify-start pl-12 shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-gray-700 font-bold text-sm">Register with Google</span>
          </button>
          <button type="button" className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors justify-start pl-12 shadow-sm">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="text-gray-700 font-bold text-sm">Register with Facebook</span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span className="text-green-900 font-bold cursor-pointer hover:underline" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>

      {/* Right Column - Image */}
      <div className="hidden lg:block w-1/2 relative bg-green-900">
        <Image
          src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Camping"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20"></div> {/* Overlay for better text contrast if needed */}
      </div>
    </main>
  )
}
