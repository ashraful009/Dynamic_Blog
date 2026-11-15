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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
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
  coverImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  status?: "DRAFT" | "PUBLISHED";
  categoryId?: string | null;
  categoryIds?: string[];
  tagIds?: string[];
  readTime?: number | null;
  isFeatured?: boolean;
  displayOrder?: number | null;
}

export type UpdatePostData = Partial<CreatePostData>;

export const postsApi = {
  getAllAdmin: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get("/posts/admin/list", { params }),
  getById: (id: string) => api.get(`/posts/admin/${id}`),
  create: (data: CreatePostData) => api.post("/posts", data),
  update: (id: string, data: UpdatePostData) => api.patch(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
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
  delete: (id: string) => api.delete(`/media/${id}`),
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
  create: (data: {
    name: string;
    slug?: string;
    parentId?: string | null;
    showInHeader?: boolean;
  }) => api.post("/categories", data),
  update: (
    id: string,
    data: {
      name?: string;
      slug?: string;
      parentId?: string | null;
      showInHeader?: boolean;
    }
  ) => api.patch(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
  reorder: (data: { parentId: string | null; orderedIds: string[] }) =>
    api.patch("/categories/reorder", data),
};

export const tagsApi = {
  getAll: () => api.get("/tags"),
  create: (data: { name: string; slug?: string }) => api.post("/tags", data),
  update: (id: string, data: { name?: string; slug?: string }) =>
    api.patch(`/tags/${id}`, data),
  delete: (id: string) => api.delete(`/tags/${id}`),
};

export const subscribersApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get("/subscribers", { params }),
  delete: (id: string) => api.delete(`/subscribers/${id}`),
};

