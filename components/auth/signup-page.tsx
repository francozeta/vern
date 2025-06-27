"use client"

import { useState } from "react"
import LoginForm from "@/components/auth/login-form"
import SignUpForm from "@/components/auth/signup-form"

export default function SignUpPage() {
  const [showLogin, setShowLogin] = useState(false)

  if (showLogin) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <LoginForm
            onGoogleLogin={async () => {
              // Will be handled by auth helpers
            }}
            onSpotifyLogin={async () => {
              // Will be handled by auth helpers
            }}
            onEmailLogin={async (email: string, password: string) => {
              // Will be handled by auth helpers
            }}
            onSignUpClick={() => setShowLogin(false)}
            onForgotPasswordClick={() => {
              console.log("Navigate to forgot password")
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <SignUpForm onSignInClick={() => setShowLogin(true)} />
      </div>
    </div>
  )
}
