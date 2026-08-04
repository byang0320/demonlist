'use client'

import { signIn } from 'next-auth/react'

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#080b14] px-5 text-[#f4f6ff]">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111725]/90 p-8 text-center shadow-2xl shadow-black/20">
        <p className="text-xs font-bold uppercase tracking-[0.10em] text-[#c6beff]">
          Stream VC Demonlist
        </p>
        <h1 className="mt-3 text-3xl font-bold">Admin Login</h1>
        <p className="mt-3 text-sm leading-6 text-[#b9c2d8]">
          Sign in with an authorized Google account to manage the demonlist.
        </p>
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/admin' })}
          className="mt-6 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-md border border-[#dadce0] bg-white px-5 text-sm font-medium tracking-[0.01em] text-[#3c4043] shadow-[0_1px_2px_rgba(60,64,67,0.15)] transition hover:bg-[#f8fafd] hover:shadow-[0_1px_3px_rgba(60,64,67,0.25)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4285f4]/30"
          style={{ fontFamily: 'Roboto, Arial, sans-serif' }}
        >
          <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.26Z"
            />
            <path
              fill="#34A853"
              d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.74 9.74 0 0 0 12 21.6Z"
            />
            <path
              fill="#FBBC05"
              d="M6.53 13.68A5.86 5.86 0 0 1 6.22 12c0-.58.11-1.14.31-1.68V7.79H3.28A9.6 9.6 0 0 0 2.25 12c0 1.52.36 2.96 1.03 4.21l3.25-2.53Z"
            />
            <path
              fill="#EA4335"
              d="M12 6.29c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.38 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.72 5.39l3.25 2.53C7.3 8.01 9.46 6.29 12 6.29Z"
            />
          </svg>
          Continue with Google
        </button>
      </section>
    </main>
  )
}
