import type { User } from "../types";
import { request } from "./client";

export const listUsers = async () => (await request<User[]>("/users")).data;

export const getUser = async (id: number) => (await request<User>(`/users/${id}`)).data;
