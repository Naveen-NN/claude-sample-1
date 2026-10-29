import { useSearchParams } from "react-router-dom";
import { listPosts } from "../api/posts";
import { PostCard } from "../components/PostCard";
import { ErrorMessage, Loading } from "../components/Status";
import { UserSearch } from "../components/UserSearch";
import { useStore } from "../store";
import { useAsync } from "../useAsync";
import { useDeletePost } from "../usePostActions";

const PAGE_SIZE = 10;

/** The server only accepts positive integers; anything else falls back to the default. */
function positiveInt(raw: string | null): number | undefined {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export function PostsList() {
  const [params, setParams] = useSearchParams();
  const page = positiveInt(params.get("page")) ?? 1;
  const userId = positiveInt(params.get("userId"));
  const { created, applyLocal, deleted } = useStore();
  const { remove, deletingId } = useDeletePost();

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
        <UserSearch
          value={userId}
          onChange={(id) => update({ userId: id })}
          allowClear
          placeholder="Filter by user…"
          aria-label="Filter by user"
        />
      </div>

      {error && <ErrorMessage error={error} />}
      {/* Hide the previous page/filter's posts while the new ones load. */}
      {loading ? (
        <Loading />
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={remove} deleting={deletingId === post.id} />
        ))
      )}
      {!loading && data && posts.length === 0 && <p className="muted">No posts.</p>}

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
