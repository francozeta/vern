"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { GradientAvatar } from "@/components/gradient-avatar"
import { Camera, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  onImageSelect: (file: File | null) => void
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-40 h-40",
}

export function AvatarUpload({ userId, currentAvatarUrl, onImageSelect, size = "xl", className }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File | null) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      onImageSelect(file)
    } else {
      setPreviewUrl(currentAvatarUrl || null)
      onImageSelect(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    onImageSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div
        className={cn(
          "relative group cursor-pointer rounded-full overflow-hidden border-2 border-dashed transition-all",
          sizeClasses[size],
          isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl || "/placeholder.svg"} alt="Profile preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            {previewUrl !== currentAvatarUrl && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage()
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
            <GradientAvatar userId={userId} size={size === "xl" ? "lg" : "md"} />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          {previewUrl ? "Click to change photo" : "Click or drag to upload photo"}
        </p>
        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null
          handleFileSelect(file)
        }}
      />
    </div>
  )
}
