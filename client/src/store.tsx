import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Post } from "./types";

const NOTICE_MS = 6000;

/**
 * jsonplaceholder fakes writes, so changes are kept here and layered over
 * fetched data to make the UI behave as if they persisted (until reload).
 */
interface Store {
  created: Post[];
  edited: Record<number, Post>;
  deleted: Set<number>;
  notice?: string;
  addCreated(post: Post): Post;
  saveEdited(post: Post): void;
  markDeleted(id: number): void;
  findLocal(id: number): Post | undefined;
  applyLocal(posts: Post[]): Post[];
  setNotice(message?: string): void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [created, setCreated] = useState<Post[]>([]);
  const [edited, setEdited] = useState<Record<number, Post>>({});
  const [deleted, setDeleted] = useState<Set<number>>(new Set());
  const [notice, setNotice] = useState<string>();

  // Auto-dismiss so a notice (especially a failure) doesn't linger across pages.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(undefined), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  const addCreated = useCallback(
    (post: Post) => {
      // The upstream always returns id 101 for new posts; keep ids unique locally.
      const maxId = Math.max(100, ...created.map((p) => p.id));
      const withId = { ...post, id: post.id > maxId ? post.id : maxId + 1 };
      setCreated((list) => [withId, ...list]);
      return withId;
    },
    [created],
  );

  const saveEdited = useCallback((post: Post) => {
    setCreated((list) => list.map((p) => (p.id === post.id ? post : p)));
    setEdited((map) => ({ ...map, [post.id]: post }));
  }, []);

  const markDeleted = useCallback((id: number) => {
    setDeleted((set) => new Set(set).add(id));
  }, []);

  const value = useMemo<Store>(
    () => ({
      created,
      edited,
      deleted,
      notice,
      addCreated,
      saveEdited,
      markDeleted,
      setNotice,
      findLocal: (id) => (deleted.has(id) ? undefined : (created.find((p) => p.id === id) ?? edited[id])),
      applyLocal: (posts) => posts.filter((p) => !deleted.has(p.id)).map((p) => edited[p.id] ?? p),
    }),
    [created, edited, deleted, notice, addCreated, saveEdited, markDeleted],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}
