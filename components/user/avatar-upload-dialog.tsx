"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ImageCrop, ImageCropContent, ImageCropReset, ImageCropApply } from "@/components/ui/shadcn-io/image-crop"

interface AvatarUploadDialogProps {
  file: File
  open: boolean
  onOpenChange: (open: boolean) => void
  onCropComplete: (croppedImage: string) => void
}

export function AvatarUploadDialog({ file, open, onOpenChange, onCropComplete }: AvatarUploadDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirmCrop = async () => {
    setIsProcessing(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Recortar Avatar</DialogTitle>
          <DialogDescription>
            Ajusta tu imagen para que sea cuadrada (1:1). Puedes mover y cambiar el tamaño del área de recorte.
          </DialogDescription>
        </DialogHeader>

        <ImageCrop
          file={file}
          aspect={1}
          onCrop={(croppedImage) => {
            onCropComplete(croppedImage)
            onOpenChange(false)
          }}
        >
          <div className="space-y-4">
            {/* Preview of the crop */}
            <ImageCropContent className="rounded-lg overflow-hidden border border-border" />

            <div className="flex items-center justify-between gap-2">
              <ImageCropReset asChild>
                <Button variant="outline" size="sm">
                  Reiniciar
                </Button>
              </ImageCropReset>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">
                  Cancelar
                </Button>
                <ImageCropApply asChild>
                  <Button size="sm" disabled={isProcessing}>
                    {isProcessing ? "Procesando..." : "Confirmar"}
                  </Button>
                </ImageCropApply>
              </div>
            </div>
          </div>
        </ImageCrop>
      </DialogContent>
    </Dialog>
  )
}
