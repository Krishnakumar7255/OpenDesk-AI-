export function formatBytes(bytes = 0) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function getErrorMessage(error, fallback = 'Something went wrong.') {
  return error instanceof Error && error.message ? error.message : fallback;
}
