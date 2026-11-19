/** Resolve a project-local asset under the Vite deployment base. */
export function siteAssetUrl(path: string) {
  return (import.meta.env?.BASE_URL ?? '/') + path.replace(/^\//, '')
}
