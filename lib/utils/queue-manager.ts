export function getNextIndex(
  currentIndex: number,
  queueLength: number,
  repeatMode: "off" | "one" | "all",
  isShuffle: boolean,
  shuffleHistory: number[] = [],
): number {
  if (repeatMode === "one") return currentIndex

  if (isShuffle) {
    const availableIndices = Array.from({ length: queueLength }, (_, i) => i).filter(
      (i) => !shuffleHistory.includes(i) || shuffleHistory.length >= queueLength - 1,
    )
    return availableIndices[Math.floor(Math.random() * availableIndices.length)] ?? 0
  }

  const nextIndex = currentIndex + 1

  if (nextIndex >= queueLength) {
    return repeatMode === "all" ? 0 : -1
  }

  return nextIndex
}

export function getPreviousIndex(currentIndex: number, queueLength: number): number {
  if (currentIndex <= 0) return 0
  return currentIndex - 1
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
