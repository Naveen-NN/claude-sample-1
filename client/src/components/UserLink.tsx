import { Link } from "react-router-dom";
import { useUsers } from "../useUsers";

/** Links to a user's profile, falling back to the id until names load. */
export function UserLink({ userId }: { userId: number }) {
  const { userById } = useUsers();
  return <Link to={`/users/${userId}`}>{userById(userId)?.name ?? `user ${userId}`}</Link>;
}
