"use client"
import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <LoginForm
          onSignUpClick={() => {
            window.location.href = "/signup"
          }}
          onForgotPasswordClick={() => {
            window.location.href = "/auth/forgot-password"
          }}
        />
      </div>
    </div>
  )
}
