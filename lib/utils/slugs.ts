/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Replace spaces and special characters with hyphens
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, "")
      // Limit length to 50 characters
      .substring(0, 50)
      .replace(/-+$/, "")
  ) // Remove trailing hyphen if substring cuts in the middle
}

/**
 * Generate a unique slug by checking against existing slugs
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkSlugExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = baseSlug
  let counter = 1

  // Check if the base slug already exists
  while (await checkSlugExists(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

/**
 * Create a review slug from title and artist
 */
export function createReviewSlug(title: string, artist: string): string {
  const combinedText = `${title} ${artist}`.trim()
  return generateSlug(combinedText)
}
