// Regola di accesso all'archivio.
//
// L'ultima edizione resta pubblica: è la vetrina del prodotto e ciò che i
// motori di ricerca devono poter indicizzare per intero. Le edizioni
// precedenti sono il motivo per cui vale la pena iscriversi, quindi si aprono
// solo con una sessione da iscritto.

export function isLatestIssue(slug: string, latestSlug: string | null): boolean {
  return latestSlug !== null && slug === latestSlug
}

export function canReadIssue(
  slug: string,
  latestSlug: string | null,
  hasReaderSession: boolean,
): boolean {
  return hasReaderSession || isLatestIssue(slug, latestSlug)
}
