import { Link, useParams } from "react-router-dom";
import { listPosts } from "../api/posts";
import { getUser } from "../api/users";
import { PostCard } from "../components/PostCard";
import { ErrorMessage, Loading } from "../components/Status";
import { useStore } from "../store";
import { useAsync } from "../useAsync";
import { useDeletePost } from "../usePostActions";

export function UserDetail() {
  const id = Number(useParams().id);
  const { created, applyLocal, deleted } = useStore();
  const { remove, deletingId } = useDeletePost();

  const { data, error, loading } = useAsync(async () => {
    const [user, { posts }] = await Promise.all([getUser(id), listPosts({ page: 1, limit: 100, userId: id })]);
    return { user, posts };
  }, [id]);

  if (error) return <ErrorMessage error={error} />;
  if (loading || !data) return <Loading />;

  const { user } = data;
  const localNew = created.filter((p) => !deleted.has(p.id) && p.userId === id);
  const posts = [...localNew, ...applyLocal(data.posts)];
  const { street, suite, city, zipcode } = user.address;

  return (
    <>
      <p>
        <Link to="/">← All posts</Link>
      </p>
      <article className="card">
        <h1>{user.name}</h1>
        <p className="muted">@{user.username}</p>
        <dl className="user-details">
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${user.email}`}>{user.email}</a>
          </dd>
          <dt>Phone</dt>
          <dd>{user.phone}</dd>
          <dt>Website</dt>
          <dd>
            <a href={`https://${user.website}`} target="_blank" rel="noreferrer">
              {user.website}
            </a>
          </dd>
          <dt>Company</dt>
          <dd>
            {user.company.name}
            <span className="muted"> · “{user.company.catchPhrase}”</span>
          </dd>
          <dt>Address</dt>
          <dd>
            {street}, {suite}, {city} {zipcode}
          </dd>
        </dl>
      </article>
      <h2>Posts ({posts.length})</h2>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={remove} deleting={deletingId === post.id} />
      ))}
      {posts.length === 0 && <p className="muted">No posts.</p>}
    </>
  );
}
