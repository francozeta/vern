"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import Logo from "@/components/ui/logo"
import { FaGoogle, FaSpotify } from "react-icons/fa"

// Add these imports at the top:
import { signInWithEmail, signInWithProvider } from "@/lib/auth/auth-helpers"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface LoginFormProps {
  onGoogleLogin?: () => void
  onSpotifyLogin?: () => void
  onEmailLogin?: (email: string, password: string) => void
  onSignUpClick?: () => void
  onForgotPasswordClick?: () => void
}

export default function LoginForm({
  onGoogleLogin,
  onSpotifyLogin,
  onEmailLogin,
  onSignUpClick,
  onForgotPasswordClick,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Replace the existing handler functions with these:
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    try {
      await signInWithEmail(email, password)
      toast.success("Welcome back!")
      router.push("/")
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await signInWithProvider("google")
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpotifyLogin = async () => {
    setIsLoading(true)
    try {
      await signInWithProvider("spotify")
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Spotify")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-8">
      {/* Logo */}
      <div className="flex justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-800 rounded-xl flex items-center justify-center border border-neutral-700">
          <Logo width={32} height={26} className="sm:w-10 sm:h-8" fill="#ffffff" />
        </div>
      </div>

      {/* Welcome Text */}
      <div className="text-center space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">Welcome to VERN</h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          Don't have an account?{" "}
          <button
            onClick={onSignUpClick}
            className="text-white hover:text-neutral-200 transition-colors font-medium underline underline-offset-2"
          >
            Sign up for free
          </button>
        </p>
      </div>

      {/* Social Login Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          variant="outline"
          className="w-full h-11 sm:h-12 bg-neutral-900 border-neutral-700 text-white hover:bg-neutral-800 hover:border-neutral-600 transition-all duration-200 text-sm sm:text-base"
        >
          <FaGoogle className="w-4 h-4 sm:w-5 sm:h-5 mr-3" />
          Continue with Google
        </Button>

        <Button
          onClick={handleSpotifyLogin}
          disabled={isLoading}
          variant="outline"
          className="w-full h-11 sm:h-12 bg-neutral-900 border-neutral-700 text-white hover:bg-neutral-800 hover:border-neutral-600 transition-all duration-200 text-sm sm:text-base"
        >
          <FaSpotify className="w-4 h-4 sm:w-5 sm:h-5 mr-3" />
          Continue with Spotify
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-700"></div>
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className="px-4 bg-neutral-950 text-neutral-400">Or continue with email</span>
        </div>
      </div>

      {/* Email Login Form */}
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 sm:pl-11 h-11 sm:h-12 bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 text-sm sm:text-base"
            required
            disabled={isLoading}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 sm:pl-11 pr-10 sm:pr-11 h-11 sm:h-12 bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 text-sm sm:text-base"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-300 transition-colors"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full h-11 sm:h-12 bg-white text-black hover:bg-neutral-100 font-medium transition-colors text-sm sm:text-base disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {/* Forgot Password */}
      <div className="text-center">
        <button
          onClick={onForgotPasswordClick}
          className="text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors underline underline-offset-2"
        >
          Forgot your password?
        </button>
      </div>
    </div>
  )
}
