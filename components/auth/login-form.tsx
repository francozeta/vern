"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/app/actions/auth"
import { signInSchema, type SignInInput } from "@/lib/validations/auth"
import { SiVercel } from "react-icons/si"
import { FaGoogle, FaSpotify } from "react-icons/fa"
import { AlertCircle } from "lucide-react"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
  })

  const onSubmit = async (data: SignInInput) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("password", data.password)

      await signIn(formData)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <SiVercel className="size-6" />
              </div>
              <span className="sr-only">VERN</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to VERN</h1>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register("email")}
                type="email"
                placeholder="m@example.com"
                className={cn(errors.email && "border-destructive")}
              />
              {errors.email && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="size-4" />
                  {errors.email.message}
                </div>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                {...register("password")}
                type="password"
                placeholder="Enter your password"
                className={cn(errors.password && "border-destructive")}
              />
              {errors.password && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="size-4" />
                  {errors.password.message}
                </div>
              )}
            </div>

            {submitError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4" />
                {submitError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting || !isValid}>
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </div>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">Or</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" type="button" className="w-full bg-transparent" disabled={true}>
              <FaSpotify className="size-4" />
              Continue with Spotify
            </Button>
            <Button variant="outline" type="button" className="w-full bg-transparent" disabled={true}>
              <FaGoogle className="size-4" />
              Continue with Google
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  )
}
