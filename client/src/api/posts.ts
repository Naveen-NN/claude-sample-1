import type { Comment, Post, PostInput } from "../types";
import { request } from "./client";

export interface ListParams {
  page: number;
  limit: number;
  userId?: number;
}

export async function listPosts({ page, limit, userId }: ListParams): Promise<{ posts: Post[]; total: number }> {
  const params = new URLSearchParams({ _page: String(page), _limit: String(limit) });
  if (userId) params.set("userId", String(userId));
  const { data, res } = await request<Post[]>(`/posts?${params}`);
  return { posts: data, total: Number(res.headers.get("X-Total-Count") ?? data.length) };
}

export const getPost = async (id: number) => (await request<Post>(`/posts/${id}`)).data;

export const getComments = async (id: number) => (await request<Comment[]>(`/posts/${id}/comments`)).data;

export const createPost = async (input: PostInput) =>
  (await request<Post>("/posts", { method: "POST", body: JSON.stringify(input) })).data;

export const updatePost = async (id: number, input: PostInput) =>
  (await request<Post>(`/posts/${id}`, { method: "PUT", body: JSON.stringify(input) })).data;

export const deletePost = async (id: number) => {
  await request<void>(`/posts/${id}`, { method: "DELETE" });
};
