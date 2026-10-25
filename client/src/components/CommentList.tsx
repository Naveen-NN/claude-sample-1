import type { Comment } from "../types";

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) return <p className="muted">No comments.</p>;
  return (
    <ul className="comments">
      {comments.map((c) => (
        <li key={c.id}>
          <strong>{c.name}</strong> <span className="muted">{c.email}</span>
          <p>{c.body}</p>
        </li>
      ))}
    </ul>
  );
}
