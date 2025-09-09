import { notFound } from "next/navigation"
import { Disc, Play, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

async function getArtistData(id: string) {
  try {
    const response = await fetch(`https://api.deezer.com/artist/${id}`)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("Error fetching artist:", error)
    return null
  }
}

async function getArtistTopTracks(id: string) {
  try {
    const response = await fetch(`https://api.deezer.com/artist/${id}/top?limit=10`)
    if (!response.ok) return []
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error fetching artist tracks:", error)
    return []
  }
}

export default async function ArtistPage({ params }: { params: { id: string } }) {
  const [artist, topTracks] = await Promise.all([getArtistData(params.id), getArtistTopTracks(params.id)])

  if (!artist) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Artist Header */}
      <div className="relative h-64 md:h-80">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-black">
          <Image
            src={artist.picture_xl || artist.picture_big || "/placeholder.svg"}
            alt={artist.name}
            fill
            className="object-cover opacity-30"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-end gap-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-zinc-700 flex-shrink-0">
              <Image
                src={artist.picture_xl || artist.picture_big || "/placeholder.svg"}
                alt={artist.name}
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Disc className="h-5 w-5 text-zinc-400" />
                <span className="text-sm text-zinc-400 font-medium">ARTIST</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{artist.name}</h1>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {artist.nb_fan?.toLocaleString() || 0} fans
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Top Tracks */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Popular Tracks</h2>
            <div className="space-y-2">
              {topTracks.map((track: any, index: number) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-900 cursor-pointer group transition-colors"
                >
                  <span className="text-zinc-400 text-sm w-6 text-center">{index + 1}</span>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-700 flex-shrink-0">
                    <Image
                      src={track.album.cover_medium || "/placeholder.svg"}
                      alt={track.title}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{track.title}</p>
                    <p className="text-sm text-zinc-400 truncate">{track.album.title}</p>
                  </div>
                  <div className="text-sm text-zinc-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, "0")}
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
