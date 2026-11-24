/** Artificial latency for stub loaders/mutations (demo loading UI). */
export function stubDelay(ms = 400): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
