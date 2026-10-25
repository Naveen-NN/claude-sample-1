import { Link, useNavigate, useParams } from "react-router-dom";
import { getComments, getPost } from "../api/posts";
import { CommentList } from "../components/CommentList";
import { ErrorMessage, Loading } from "../components/Status";
import { UserLink } from "../components/UserLink";
import { useStore } from "../store";
import type { Comment, Post } from "../types";
import { useAsync } from "../useAsync";
import { isLocalOnly, useDeletePost } from "../usePostActions";

export function PostDetail() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { findLocal, deleted } = useStore();
  const { remove, deletingId } = useDeletePost();
  const local = findLocal(id);

  const { data, error, loading } = useAsync<{ post: Post; comments: Comment[] }>(async () => {
    if (isLocalOnly(id)) {
      if (!local) throw new Error("Post not found");
      return { post: local, comments: [] };
    }
    const [post, comments] = await Promise.all([getPost(id), getComments(id)]);
    return { post, comments };
  }, [id]);

  if (deleted.has(id)) {
    return (
      <p>
        This post was deleted. <Link to="/">Back to posts</Link>
      </p>
    );
  }
  if (error) return <ErrorMessage error={error} />;
  if (loading || !data) return <Loading />;

  const post = local ?? data.post;
  return (
    <>
      <p>
        <Link to="/">← All posts</Link>
      </p>
      <article className="card">
        <h1>{post.title}</h1>
        <p className="muted">
          #{post.id} · by <UserLink userId={post.userId} />
        </p>
        <p className="body">{post.body}</p>
        <div className="actions">
          <Link to={`/posts/${post.id}/edit`} className="button secondary">
            Edit
          </Link>
          <button
            className="danger"
            disabled={deletingId === post.id}
            onClick={async () => (await remove(post)) && navigate("/")}
          >
            Delete
          </button>
        </div>
      </article>
      <h2>Comments ({data.comments.length})</h2>
      <CommentList comments={data.comments} />
    </>
  );
}
