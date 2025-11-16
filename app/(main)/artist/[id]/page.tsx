// app/(main)/artist/[id]/page.tsx

import { fetchArtistDeezerData } from "@/lib/artist/fetchArtist"
import { getArtistFromDB } from "@/lib/artist/getArtistFull"
import Image from "next/image"
import Link from "next/link"

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const deezerArtist = await fetchArtistDeezerData(id)
  const dbArtist = await getArtistFromDB(id)

  if (!deezerArtist && !dbArtist) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold">Artist not found</h1>
        <Link href="/" className="text-blue-400 underline">
          Go back</Link>
      </div>
    )
  }

  const artistName = deezerArtist?.name ?? dbArtist?.name ?? "Unknown Artist"
  const followers = deezerArtist?.nb_fan

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-6">
        <Image
          src={deezerArtist?.picture_big ?? dbArtist?.image_url ?? "/placeholder.png"}
          alt={artistName}
          width={180}
          height={180}
          className="rounded-xl object-cover"
        />
        <div>
          <h1 className="text-4xl font-bold">{artistName}</h1>
          {followers != null && (
            <p className="text-zinc-400">
              {followers.toLocaleString()} followers
            </p>
          )}
        </div>
      </div>

      {/* SONGS NORMALIZADAS EN VERN */}
      {dbArtist?.songs && dbArtist.songs.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Songs on VERN</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dbArtist.songs.map((song: any) => (
              <Link key={song.id} href={`/song/${song.id}`}>
                <div className="bg-zinc-900 p-3 rounded-lg hover:bg-zinc-800 transition">
                  {song.cover_url && (
                    <Image
                      src={song.cover_url}
                      width={250}
                      height={250}
                      alt={song.title}
                      className="rounded mb-2 object-cover"
                    />
                  )}
                  <h3 className="font-medium">{song.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* TOP TRACKS DE DEEZER */}
      {deezerArtist?.topTracks?.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Top Tracks</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {deezerArtist.topTracks.map((track: any) => (
              <Link key={track.id} href={`/song/deezer/${track.id}`}>
                <div className="bg-zinc-900 p-3 rounded-lg hover:bg-zinc-800 transition">
                  <Image
                    src={track.album.cover_medium}
                    width={250}
                    height={250}
                    alt={track.title}
                    className="rounded mb-2 object-cover"
                  />
                  <h3 className="font-medium">{track.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
