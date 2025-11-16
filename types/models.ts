import { Database } from "@/types/db"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export type Song = Database["public"]["Tables"]["songs"]["Row"] & {
  artist?: Artist | null
  album?: Album | null
}

export type Artist = Database["public"]["Tables"]["artists"]["Row"]
export type Album = Database["public"]["Tables"]["albums"]["Row"]

export type Review = Database["public"]["Tables"]["reviews"]["Row"] & {
  song: Song
  user: Profile
  likes_count: number
  comments_count: number
}

export type Comment = Database["public"]["Tables"]["review_comments"]["Row"] & {
  user: Profile
}

export type Follow = {
  follower: Profile
  following: Profile
}
