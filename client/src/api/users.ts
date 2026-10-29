import type { User } from "../types";
import { request } from "./client";

export const listUsers = async () => (await request<User[]>("/users")).data;

export const searchUsers = async (q: string, signal?: AbortSignal) =>
  (await request<User[]>(`/users?${new URLSearchParams({ q })}`, { signal })).data;

export const getUser = async (id: number) => (await request<User>(`/users/${id}`)).data;
