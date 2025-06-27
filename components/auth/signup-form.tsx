"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { FaGoogle, FaSpotify } from "react-icons/fa"
import { signUpWithEmail, signInWithProvider } from "@/lib/auth/auth-helpers"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SignUpFormProps {
  onSignInClick?: () => void
}

export default function SignUpForm({ onSignInClick }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    displayName: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password || !formData.username || !formData.displayName) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      await signUpWithEmail(formData.email, formData.password, formData.username, formData.displayName)
      toast.success("Account created successfully!")
      // Redirect directly to onboarding instead of verify-email
      router.push("/onboarding")
    } catch (error: any) {
      toast.error(error.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignUp = async (provider: "google" | "spotify") => {
    setIsLoading(true)
    try {
      await signInWithProvider(provider)
    } catch (error: any) {
      toast.error(error.message || `Failed to sign up with ${provider}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-8">
      {/* Logo */}
      <div className="flex justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-800 rounded-xl flex items-center justify-center border border-neutral-700">
          <span className="text-white font-bold text-xl sm:text-2xl">V</span>
        </div>
      </div>

      {/* Welcome Text */}
      <div className="text-center space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">Join VERN</h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          Already have an account?{" "}
          <button
            onClick={onSignInClick}
            className="text-white hover:text-neutral-200 transition-colors font-medium underline underline-offset-2"
          >
            Sign in
          </button>
        </p>
      </div>

      {/* Social Sign Up Buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => handleSocialSignUp("google")}
          disabled={isLoading}
          variant="outline"
          className="w-full h-11 sm:h-12 bg-neutral-900 border-neutral-700 text-white hover:bg-neutral-800 hover:border-neutral-600 transition-all duration-200 text-sm sm:text-base"
        >
          <FaGoogle className="w-4 h-4 sm:w-5 sm:h-5 mr-3" />
          Continue with Google
        </Button>

        <Button
          onClick={() => handleSocialSignUp("spotify")}
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
          <span className="px-4 bg-neutral-950 text-neutral-400">Or create account with email</span>
        </div>
      </div>

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Label htmlFor="username" className="text-neutral-300 text-sm">
              Username
            </Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                className="pl-10 sm:pl-11 h-11 sm:h-12 bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 text-sm sm:text-base"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="relative">
            <Label htmlFor="displayName" className="text-neutral-300 text-sm">
              Display Name
            </Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                id="displayName"
                type="text"
                placeholder="Your Name"
                value={formData.displayName}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                className="pl-10 sm:pl-11 h-11 sm:h-12 bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 text-sm sm:text-base"
                required
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="relative">
          <Label htmlFor="email" className="text-neutral-300 text-sm">
            Email
          </Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="pl-10 sm:pl-11 h-11 sm:h-12 bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 text-sm sm:text-base"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="relative">
          <Label htmlFor="password" className="text-neutral-300 text-sm">
            Password
          </Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
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
        </div>

        <Button
          type="submit"
          disabled={isLoading || !formData.email || !formData.password || !formData.username || !formData.displayName}
          className="w-full h-11 sm:h-12 bg-white text-black hover:bg-neutral-100 font-medium transition-colors text-sm sm:text-base disabled:opacity-50"
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      {/* Terms */}
      <p className="text-xs text-neutral-500 text-center">
        By creating an account, you agree to our{" "}
        <a href="/terms" className="text-neutral-400 hover:text-white underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-neutral-400 hover:text-white underline">
          Privacy Policy
        </a>
      </p>
    </div>
  )
}
