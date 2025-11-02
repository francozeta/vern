"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X, ImageIcon, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BannerUploadDialog } from "@/components/user/banner-upload-dialog"

interface BannerUploadProps {
  currentBannerUrl?: string | null
  onImageSelect: (file: File | null) => void
  className?: string
}

const BANNER_WIDTH = 1200
const BANNER_HEIGHT = 300
const BANNER_RATIO = BANNER_WIDTH / BANNER_HEIGHT
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Enhanced with image crop capability
 * Allows users to upload any image and crop it to 4:1 ratio if needed
 */
export function BannerUpload({ currentBannerUrl, onImageSelect, className }: BannerUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentBannerUrl || null)
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
        setError("File size must be less than 10MB")
        resolve(false)
        return
      }

      const img = new Image()
      img.onload = () => {
        // More lenient validation - accept any image, user can crop it
        if (img.width < 600 || img.height < 150) {
          setError("Banner must be at least 600×150px")
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
      setPreviewUrl(currentBannerUrl || null)
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
        const croppedFile = new File([blob], "banner-cropped.png", { type: "image/png" })
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
      <div className={cn("space-y-3", className)}>
        <div
          className={cn(
            "relative group cursor-pointer rounded-lg overflow-hidden border-2 border-dashed transition-all w-full aspect-[4/1]",
            isDragging
              ? "border-foreground bg-muted/50"
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
              <img src={previewUrl || "/placeholder.svg"} alt="Banner preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex items-center gap-2 text-white">
                  <Camera className="w-5 h-5" />
                  <span className="text-sm font-medium">Change Banner</span>
                </div>
              </div>
              {previewUrl !== currentBannerUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-6 h-6 rounded-full"
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
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">Drag or click to upload banner</div>
                  <div className="text-xs text-muted-foreground/70">Recommended: 1200×300px</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground/70 space-y-1">
          <p>Maximum 10MB • Aspect ratio 4:1 (1200×300px ideal)</p>
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
        <BannerUploadDialog
          file={selectedFile}
          open={showCropDialog}
          onOpenChange={setShowCropDialog}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  )
}
