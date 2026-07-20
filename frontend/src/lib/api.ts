/**
 * Data Fetching Rule:
 * - Server Components (default): Use native `fetch()` for optimized caching and SSR performance.
 * - Client Components (`"use client"`): Use this `api.ts` axios instance for authenticated requests and consistent handling.
 */
import axios from "axios";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true,
});
// Request interceptor not needed for HttpOnly cookies
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        if (window.location.pathname.startsWith("/zibon")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
export default api;
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.patch("/users/profile", data),
};
export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  status?: "DRAFT" | "PUBLISHED";
  categoryId?: string;
  readTime?: number;
  isFeatured?: boolean;
  displayOrder?: number;
}
export type UpdatePostData = Partial<CreatePostData>;
export const postsApi = {
  getAllPublished: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get("/posts", { params }),
  getBySlug: (slug: string) =>
    api.get(`/posts/${slug}`),
  getAllAdmin: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get("/posts/admin/list", { params }),
  getById: (id: string) =>
    api.get(`/posts/admin/${id}`),
  create: (data: CreatePostData) =>
    api.post("/posts", data),
  update: (id: string, data: UpdatePostData) =>
    api.patch(`/posts/${id}`, data),
  delete: (id: string) =>
    api.delete(`/posts/${id}`),
};
export const mediaApi = {
  upload: (file: File, alt?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (alt) formData.append("alt", alt);
    return api.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
  },
  getAll: (params?: { page?: number; limit?: number; type?: string }) =>
    api.get("/media", { params }),
  delete: (id: string) =>
    api.delete(`/media/${id}`),
  linkToPost: (mediaId: string, postId: string) =>
    api.patch(`/media/${mediaId}/link`, { postId }),
};
export const siteSettingsApi = {
  get: () => api.get("/site-settings"),
  update: (data: Record<string, unknown>) => api.patch("/site-settings", data),
};

export const aboutApi = {
  get: () => api.get("/about"),
  update: (data: any) => api.put("/about", data),
};
export const categoriesApi = {
  getAll: () => api.get("/categories"),
  create: (data: { name: string; slug?: string }) => api.post("/categories", data),
  update: (id: string, data: { name?: string; slug?: string }) => api.patch(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};
export const subscribersApi = {
  subscribe: (email: string) => api.post("/subscribers", { email }),
  getAll: (params?: { page?: number; limit?: number }) => api.get("/subscribers", { params }),
  delete: (id: string) => api.delete(`/subscribers/${id}`),
};
export const homepageApi = {
  getData: () => api.get("/homepage"),
};

export const commentsApi = {
  getByPost: (postId: string) => api.get(`/posts/${postId}/comments`),
  create: (postId: string, data: { authorName: string; authorEmail?: string; content: string; parentId?: string }) => 
    api.post(`/posts/${postId}/comments`, data),
};
