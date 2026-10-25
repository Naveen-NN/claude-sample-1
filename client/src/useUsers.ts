import { listUsers } from "./api/users";
import type { User } from "./types";
import { useAsync } from "./useAsync";

/** The user list is small and static, so every component shares one fetch. */
let cached: Promise<User[]> | undefined;

function loadUsers(): Promise<User[]> {
  cached ??= listUsers().catch((err) => {
    cached = undefined; // allow a retry on the next mount
    throw err;
  });
  return cached;
}

export function useUsers() {
  const { data: users = [], error, loading } = useAsync(loadUsers, []);
  const userById = (id: number) => users.find((u) => u.id === id);
  return { users, userById, error, loading };
}
