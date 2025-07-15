import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Upload, PenTool, PlusCircle, PlusIcon, BookAudio, Feather } from "lucide-react"

export async function HeaderAuth() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <a href="/login">Sign In</a>
        </Button>
        <Button size="sm" asChild>
          <a href="/signup">Sign Up</a>
        </Button>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 border rounded-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Upload className="h-4 w-4" />
              <span className="sr-only">Upload Music</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload Music</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Feather className="h-4 w-4" />
              <span className="sr-only">Create Review</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create Review</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
