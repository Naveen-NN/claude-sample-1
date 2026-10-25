export function Loading() {
  return <p className="muted">Loading…</p>;
}

export function ErrorMessage({ error }: { error: Error }) {
  return <p className="error">{error.message}</p>;
}
