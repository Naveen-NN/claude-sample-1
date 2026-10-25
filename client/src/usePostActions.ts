import { useState } from "react";
import { deletePost } from "./api/posts";
import { useStore } from "./store";
import type { Post } from "./types";

export const DEMO_NOTE = "(demo API does not persist; change kept until reload)";

/** Posts with id > 100 exist only locally, so they never hit the API. */
export const isLocalOnly = (id: number) => id > 100;

export function useDeletePost() {
  const { markDeleted, setNotice } = useStore();
  const [deletingId, setDeletingId] = useState<number>();

  async function remove(post: Post): Promise<boolean> {
    if (!window.confirm(`Delete "${post.title}"?`)) return false;
    setDeletingId(post.id);
    try {
      if (!isLocalOnly(post.id)) await deletePost(post.id);
      markDeleted(post.id);
      setNotice(`Deleted post #${post.id} ${DEMO_NOTE}`);
      return true;
    } catch (err) {
      setNotice(`Delete failed: ${(err as Error).message}`);
      return false;
    } finally {
      setDeletingId(undefined);
    }
  }

  return { remove, deletingId };
}
