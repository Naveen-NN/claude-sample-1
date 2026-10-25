import { Link } from "react-router-dom";
import type { Post } from "../types";
import { UserLink } from "./UserLink";

interface Props {
  post: Post;
  onDelete(post: Post): void;
  deleting: boolean;
}

export function PostCard({ post, onDelete, deleting }: Props) {
  return (
    <article className="card">
      <Link to={`/posts/${post.id}`}>
        <h2>{post.title}</h2>
      </Link>
      <p className="muted">
        #{post.id} · by <UserLink userId={post.userId} />
      </p>
      <p>{post.body}</p>
      <div className="actions">
        <Link to={`/posts/${post.id}/edit`} className="button secondary">
          Edit
        </Link>
        <button className="danger" onClick={() => onDelete(post)} disabled={deleting}>
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </article>
  );
}
