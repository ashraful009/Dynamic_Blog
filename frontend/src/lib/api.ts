/**
 * Public Data Fetching Client
 * Server Components (default): Use native `fetch()` for optimized caching and SSR.
 * Client Components (`"use client"`): Use this `api.ts` axios instance for public interactions (comments, subscriptions).
 */
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export default api;

export const homepageApi = {
  getData: (params?: { page?: number; limit?: number }) =>
    api.get("/homepage", { params }),
};

export const postsApi = {
  getAllPublished: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categorySlug?: string;
    tagSlug?: string;
  }) => api.get("/posts", { params }),
  getBySlug: (slug: string) => api.get(`/posts/${slug}`),
};

export const commentsApi = {
  getByPost: (postId: string) => api.get(`/posts/${postId}/comments`),
  create: (
    postId: string,
    data: { authorName: string; authorEmail?: string; content: string; parentId?: string }
  ) => api.post(`/posts/${postId}/comments`, data),
};

export const subscribersApi = {
  subscribe: (email: string) => api.post("/subscribers", { email }),
};

export const categoriesApi = {
  getAll: () => api.get("/categories"),
};

export const tagsApi = {
  getAll: () => api.get("/tags"),
};

export const siteSettingsApi = {
  get: () => api.get("/site-settings"),
};

export const aboutApi = {
  get: () => api.get("/about"),
};
