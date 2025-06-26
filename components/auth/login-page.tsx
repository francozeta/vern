'use client'
import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    console.log("Google login initiated")
    // Implement Google OAuth logic here
  }

  const handleSpotifyLogin = async () => {
    console.log("Spotify login initiated")
    // Implement Spotify OAuth logic here
  }

  const handleEmailLogin = async (email: string, password: string) => {
    console.log("Email login:", { email, password })
    // Implement email/password login logic here
  }

  const handleSignUpClick = () => {
    console.log("Navigate to sign up")
    // Implement navigation to sign up page
  }

  const handleForgotPasswordClick = () => {
    console.log("Navigate to forgot password")
    // Implement navigation to forgot password page
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <LoginForm
          onGoogleLogin={handleGoogleLogin}
          onSpotifyLogin={handleSpotifyLogin}
          onEmailLogin={handleEmailLogin}
          onSignUpClick={handleSignUpClick}
          onForgotPasswordClick={handleForgotPasswordClick}
        />
      </div>
    </div>
  )
}
