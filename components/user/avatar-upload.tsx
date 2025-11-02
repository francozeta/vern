"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { GradientAvatar } from "@/components/user/gradient-avatar"
import { Camera, Upload, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AvatarUploadDialog } from "@/components/user/avatar-upload-dialog"

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  onImageSelect: (file: File | null) => void
  className?: string
}

const AVATAR_SIZE = 512
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Enhanced with image crop capability
 * Allows users to upload any image and crop it to 1:1 ratio if needed
 */
export function AvatarUpload({ userId, currentAvatarUrl, onImageSelect, className }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showCropDialog, setShowCropDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file (JPG, PNG, WebP)")
        resolve(false)
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("File size must be less than 5MB")
        resolve(false)
        return
      }

      const img = new Image()
      img.onload = () => {
        // More lenient validation - accept any image, user can crop it
        if (img.width < 256 || img.height < 256) {
          setError("Avatar must be at least 256×256px")
          resolve(false)
          return
        }

        setError(null)
        resolve(true)
      }
      img.onerror = () => {
        setError("Could not read image file")
        resolve(false)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (file: File | null) => {
    if (file) {
      const isValid = await validateImage(file)
      if (!isValid) return

      setSelectedFile(file)
      setShowCropDialog(true)
    } else {
      setPreviewUrl(currentAvatarUrl || null)
      setError(null)
      onImageSelect(null)
    }
  }

  const handleCropComplete = (croppedImage: string) => {
    setPreviewUrl(croppedImage)

    // Convert data URL to File
    fetch(croppedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const croppedFile = new File([blob], "avatar-cropped.png", { type: "image/png" })
        onImageSelect(croppedFile)
      })
      .catch(() => {
        setError("Error processing cropped image")
      })
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
    setError(null)
    onImageSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div
          className={cn(
            "relative group cursor-pointer rounded-full overflow-hidden border-2 border-dashed transition-all w-24 h-24",
            isDragging
              ? "border-foreground bg-muted/50 scale-105"
              : previewUrl
                ? "border-border hover:border-foreground/50"
                : "border-muted-foreground/30 hover:border-foreground/50 bg-muted/20",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              {previewUrl !== currentAvatarUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full"
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
            <>
              <GradientAvatar userId={userId} size="lg" className="w-full h-full" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
            </>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="py-2 w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center">
          <p className="text-xs text-muted-foreground">{previewUrl ? "Click to change" : "Click to upload"}</p>
          <p className="text-xs text-muted-foreground/70">Max 5MB • Square 1:1 ratio</p>
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

      {selectedFile && (
        <AvatarUploadDialog
          file={selectedFile}
          open={showCropDialog}
          onOpenChange={setShowCropDialog}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  )
}
