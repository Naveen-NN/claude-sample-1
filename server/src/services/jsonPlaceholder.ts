import { config } from "../config.js";
import type { Comment, Post, PostInput, User } from "../types.js";

export class UpstreamError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<{ data: T; headers: Headers }> {
  const res = await fetch(`${config.upstreamUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json; charset=UTF-8", ...init?.headers },
  });
  if (!res.ok) {
    throw new UpstreamError(res.status, `Upstream ${init?.method ?? "GET"} ${path} failed with ${res.status}`);
  }
  const text = await res.text();
  return { data: (text ? JSON.parse(text) : undefined) as T, headers: res.headers };
}

export interface ListQuery {
  userId?: number;
  _page?: number;
  _limit?: number;
}

export async function getPosts(query: ListQuery): Promise<{ posts: Post[]; total?: number }> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  const { data, headers } = await request<Post[]>(`/posts${qs ? `?${qs}` : ""}`);
  const total = headers.get("x-total-count");
  return { posts: data, total: total ? Number(total) : undefined };
}

export async function getPost(id: number): Promise<Post> {
  return (await request<Post>(`/posts/${id}`)).data;
}

export async function getComments(postId: number): Promise<Comment[]> {
  return (await request<Comment[]>(`/posts/${postId}/comments`)).data;
}

export async function createPost(input: PostInput): Promise<Post> {
  return (await request<Post>("/posts", { method: "POST", body: JSON.stringify(input) })).data;
}

export async function updatePost(id: number, input: PostInput): Promise<Post> {
  return (await request<Post>(`/posts/${id}`, { method: "PUT", body: JSON.stringify({ id, ...input }) })).data;
}

export async function patchPost(id: number, input: Partial<PostInput>): Promise<Post> {
  return (await request<Post>(`/posts/${id}`, { method: "PATCH", body: JSON.stringify(input) })).data;
}

export async function deletePost(id: number): Promise<void> {
  await request<unknown>(`/posts/${id}`, { method: "DELETE" });
}

export async function getUsers(): Promise<User[]> {
  return (await request<User[]>("/users")).data;
}

export async function getUser(id: number): Promise<User> {
  return (await request<User>(`/users/${id}`)).data;
}
