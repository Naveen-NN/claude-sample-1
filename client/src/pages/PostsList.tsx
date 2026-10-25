import { useSearchParams } from "react-router-dom";
import { listPosts } from "../api/posts";
import { PostCard } from "../components/PostCard";
import { ErrorMessage, Loading } from "../components/Status";
import { useStore } from "../store";
import { useAsync } from "../useAsync";
import { useDeletePost } from "../usePostActions";
import { useUsers } from "../useUsers";

const PAGE_SIZE = 10;

export function PostsList() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const userId = Number(params.get("userId")) || undefined;
  const { created, applyLocal, deleted } = useStore();
  const { remove, deletingId } = useDeletePost();
  const { users } = useUsers();

  const { data, error, loading } = useAsync(() => listPosts({ page, limit: PAGE_SIZE, userId }), [page, userId]);

  const update = (next: { page?: number; userId?: number }) => {
    const p = new URLSearchParams();
    const u = "userId" in next ? next.userId : userId;
    if (u) p.set("userId", String(u));
    const pg = next.page ?? 1;
    if (pg > 1) p.set("page", String(pg));
    setParams(p);
  };

  const localNew = page === 1 ? created.filter((p) => !deleted.has(p.id) && (!userId || p.userId === userId)) : [];
  const posts = [...localNew, ...applyLocal(data?.posts ?? [])];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <>
      <div className="toolbar">
        <label>
          Filter by user{" "}
          <select value={userId ?? ""} onChange={(e) => update({ userId: Number(e.target.value) || undefined })}>
            <option value="">All users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <ErrorMessage error={error} />}
      {loading && !data && <Loading />}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={remove} deleting={deletingId === post.id} />
      ))}
      {data && posts.length === 0 && <p className="muted">No posts.</p>}

      <nav className="pager">
        <button onClick={() => update({ page: page - 1 })} disabled={page <= 1 || loading}>
          ← Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={() => update({ page: page + 1 })} disabled={page >= totalPages || loading}>
          Next →
        </button>
      </nav>
    </>
  );
}
