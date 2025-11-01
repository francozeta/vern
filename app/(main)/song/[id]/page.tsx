import { notFound } from "next/navigation"
import { Music, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { PageContainer } from "@/components/layout/page-container"

async function getSongData(id: string) {
  try {
    const response = await fetch(`https://api.deezer.com/track/${id}`)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("Error fetching song:", error)
    return null
  }
}

export default async function SongPage({ params }: { params: { id: string } }) {
  const song = await getSongData(params.id)

  if (!song) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-64 md:h-80 bg-gradient-to-b from-muted to-background">
        <Image
          src={song.album.cover_xl || song.album.cover_big || "/placeholder.svg"}
          alt={`${song.title} cover`}
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-end gap-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden bg-card border-4 border-border flex-shrink-0">
              <Image
                src={song.album.cover_xl || song.album.cover_big || "/placeholder.svg"}
                alt={`${song.title} cover`}
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Music className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">SONG</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-2">{song.title}</h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-4">{song.artist.name}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{song.album.title}</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, "0")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <PageContainer maxWidth="lg">
        {/* Actions */}
        <div className="flex items-center gap-4 mb-8">
          <Button className="bg-foreground text-background hover:bg-foreground/90 font-semibold px-8">
            <Star className="h-4 w-4 mr-2" />
            Write Review
          </Button>
          {song.preview && (
            <Button variant="outline" className="border-border text-foreground hover:bg-muted bg-transparent">
              Preview Track
            </Button>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Reviews</h2>
          <div className="text-center py-12 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2 text-foreground">No reviews yet</p>
            <p className="text-sm">Be the first to review this song!</p>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
