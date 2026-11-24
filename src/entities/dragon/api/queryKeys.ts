export const dragonQueryKeys = {
  all: ['dragons'] as const,
  lists: () => [...dragonQueryKeys.all, 'list'] as const,
  detail: (id: number) => [...dragonQueryKeys.all, 'detail', id] as const,
}
