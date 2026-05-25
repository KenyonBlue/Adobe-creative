export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function resolveAssetPath(assetPath: string, projectRoot: string): string {
  if (assetPath.startsWith('/')) return assetPath;
  return `${projectRoot}/${assetPath}`.replace(/\/+/g, '/').replace(/\/\.\//g, '/');
}
