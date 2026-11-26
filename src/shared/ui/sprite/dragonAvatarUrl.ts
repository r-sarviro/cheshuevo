/** Public URL for a 32×32 dragon head (DRG-003). */
export function dragonAvatarUrl(slug: string): string {
  return `/sprites/dragons/avatars/${encodeURIComponent(slug)}.png`
}
