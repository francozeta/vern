"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface BannerUploadProps {
  currentBannerUrl?: string | null
  onImageSelect: (file: File | null) => void
  className?: string
}

export function BannerUpload({ currentBannerUrl, onImageSelect, className }: BannerUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentBannerUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File | null) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      onImageSelect(file)
    } else {
      setPreviewUrl(currentBannerUrl || null)
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
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative group cursor-pointer rounded-xl overflow-hidden border-2 border-dashed transition-all w-full h-32",
          isDragging
            ? "border-primary bg-primary/10"
            : previewUrl
              ? "border-border hover:border-primary/50"
              : "border-muted-foreground/25 hover:border-primary/50 bg-muted/30",
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
                <div className="text-sm font-medium">Click to upload banner</div>
                <div className="text-xs">Recommended: 1200x300px</div>
              </div>
            </div>
          </div>
        )}
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
